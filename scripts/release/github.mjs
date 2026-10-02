import { setTimeout as delay } from 'node:timers/promises';

export class GitHubReleases {
  constructor(repository, token, fetcher = fetch) {
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !token) {
      throw new Error('GitHub repository and token are required');
    }
    this.repository = repository;
    this.token = token;
    this.fetcher = fetcher;
  }

  async request(suffix = '', method = 'GET', data) {
    const response = await this.fetcher(
      `https://api.github.com/repos/${this.repository}/releases${suffix}`,
      {
        method,
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: data === undefined ? undefined : JSON.stringify(data),
        signal: AbortSignal.timeout(30_000),
      },
    );
    if (!response.ok) throw new Error(`GitHub release API failed: HTTP ${response.status}`);
    return response.status === 204 ? null : response.json();
  }

  async matchingReleases(tag) {
    // The list may briefly omit a new draft. Never use tag resolution to
    // decide which draft receives uploaded assets.
    const matches = [];
    for (let page = 1; ; page++) {
      const releases = await this.request(`?per_page=100&page=${page}`);
      if (!Array.isArray(releases) || releases.some((item) => typeof item?.tag_name !== 'string')) {
        throw new Error('GitHub release list is invalid');
      }
      matches.push(...releases.filter((item) => item.tag_name === tag));
      if (releases.length < 100) return matches;
    }
  }

  async find(tag) {
    return (await this.matchingReleases(tag))[0] ?? null;
  }

  async uniqueOwnedDraft(receipt, run) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const release = await this.ownedDraft(receipt, run);
      if (!release) throw new Error('Only the owned draft may be published');
      const matches = await this.matchingReleases(receipt.tag);
      if (matches.length === 1 && matches[0].id === receipt.id) return release;
      if (matches.length !== 0 || attempt === 5) {
        throw new Error(
          'Publication requires a unique visible owned draft; preserve other Releases',
        );
      }
      await delay(1_000);
    }
  }

  async createDraft(tag, notes, run, sha) {
    if (await this.find(tag))
      throw new Error('Release already exists; drafts and public assets are preserved');
    if (!/^\d+\/\d+$/.test(run) || !/^[0-9a-f]{40}$/.test(sha)) {
      throw new Error('Exact source SHA and publication run are required');
    }
    const marker = `<!-- publication-run: ${run} -->`;
    const release = await this.request('', 'POST', {
      tag_name: tag,
      target_commitish: sha,
      name: `Custom Cabinet ${tag}`,
      body: `${notes}\n\n${marker}`,
      draft: true,
      prerelease: true,
      make_latest: 'false',
    });
    if (
      !Number.isSafeInteger(release?.id) ||
      release.id <= 0 ||
      release.draft !== true ||
      release.tag_name !== tag
    ) {
      throw new Error('Created Release response is invalid; manual draft inspection required');
    }
    return { repository: this.repository, tag, id: release.id, marker };
  }

  async ownedDraft(receipt, run) {
    if (
      receipt.repository !== this.repository ||
      !Number.isSafeInteger(receipt.id) ||
      receipt.id <= 0 ||
      !/^\d+\/\d+$/.test(run) ||
      receipt.marker !== `<!-- publication-run: ${run} -->`
    ) {
      throw new Error('Draft receipt does not belong to this publication run');
    }
    const release = await this.request(`/${receipt.id}`);
    if (release?.id !== receipt.id || release.tag_name !== receipt.tag) {
      throw new Error('Draft identity does not match receipt');
    }
    return release.draft === true &&
      typeof release.body === 'string' &&
      release.body.endsWith(receipt.marker)
      ? release
      : null;
  }

  async cleanup(receipt, run) {
    if (!(await this.ownedDraft(receipt, run))) return false;
    await this.request(`/${receipt.id}`, 'DELETE');
    return true;
  }

  async publish(receipt, run, prerelease) {
    await this.uniqueOwnedDraft(receipt, run);
    if (typeof prerelease !== 'boolean') throw new Error('Explicit prerelease policy is required');
    await this.request(`/${receipt.id}`, 'PATCH', {
      draft: false,
      prerelease,
      make_latest: 'false',
    });
  }
}
