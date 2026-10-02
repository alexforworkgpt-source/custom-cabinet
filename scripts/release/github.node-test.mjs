import assert from 'node:assert/strict';
import { test } from 'node:test';

test('Publication waits for own draft visibility without creating another draft', async () => {
  const { GitHubReleases } = await import('./github.mjs');
  const receipt = {
    repository: 'OWNER/custom-cabinet',
    tag: 'cabinet-v2026.10.01',
    id: 12,
    marker: '<!-- publication-run: 123/1 -->',
  };
  const owned = { id: 12, tag_name: receipt.tag, draft: true, body: receipt.marker };
  const methods = [];
  let lists = 0;
  const api = new GitHubReleases(receipt.repository, 'fictional-token', async (url, options) => {
    methods.push(options.method);
    if (options.method === 'PATCH') return Response.json({});
    return Response.json(
      new URL(url).pathname.endsWith('/12') ? owned : ++lists === 1 ? [] : [owned],
    );
  });
  await api.publish(receipt, '123/1', true);
  assert.deepEqual(methods, ['GET', 'GET', 'GET', 'GET', 'PATCH']);
});

test('Duplicate or invisible owned draft cannot be published', async () => {
  const { GitHubReleases } = await import('./github.mjs');
  const receipt = {
    repository: 'OWNER/custom-cabinet',
    tag: 'cabinet-v2026.10.01',
    id: 12,
    marker: '<!-- publication-run: 123/1 -->',
  };
  const owned = { id: 12, tag_name: receipt.tag, draft: true, body: receipt.marker };
  const foreign = { ...owned, id: 13, body: 'another publication' };
  for (const visible of [[], [foreign], [owned, foreign]]) {
    const methods = [];
    const api = new GitHubReleases(receipt.repository, 'fictional-token', async (url, options) => {
      methods.push(options.method);
      return Response.json(new URL(url).pathname.endsWith('/12') ? owned : visible);
    });
    await assert.rejects(api.publish(receipt, '123/1', true), /unique visible owned draft/);
    assert.ok(methods.every((method) => method === 'GET'));
  }
});

test('API failures are not treated as an absent Cabinet Release', async () => {
  const { GitHubReleases } = await import('./github.mjs');
  for (const status of [401, 403, 404, 429, 500]) {
    const api = new GitHubReleases(
      'OWNER/custom-cabinet',
      'fictional-token',
      async () => new Response('{}', { status }),
    );
    await assert.rejects(api.find('cabinet-v2026.10.01'), new RegExp(`HTTP ${status}`));
  }
});

test('Existing drafts and public Releases are preserved, even on a later page', async () => {
  const { GitHubReleases } = await import('./github.mjs');
  for (const draft of [true, false]) {
    const methods = [];
    const api = new GitHubReleases(
      'OWNER/custom-cabinet',
      'fictional-token',
      async (url, options) => {
        methods.push(options.method);
        return Response.json(
          new URL(url).searchParams.get('page') === '1'
            ? Array.from({ length: 100 }, (_, i) => ({ tag_name: `historical-${i}` }))
            : [{ tag_name: 'cabinet-v2026.10.01', draft }],
        );
      },
    );
    await assert.rejects(
      api.createDraft('cabinet-v2026.10.01', 'Notes', '123/1', 'a'.repeat(40)),
      /already exists/,
    );
    assert.deepEqual(methods, ['GET', 'GET']);
  }
});

test('Only the owned draft can be deleted or published; publication never selects latest', async () => {
  const { GitHubReleases } = await import('./github.mjs');
  for (const [draft, foreign] of [
    [true, false],
    [false, false],
    [true, true],
  ]) {
    const requests = [];
    const receipt = {
      repository: 'OWNER/custom-cabinet',
      tag: 'cabinet-v2026.10.01',
      id: 12,
      marker: '<!-- publication-run: 123/1 -->',
    };
    const api = new GitHubReleases(receipt.repository, 'fictional-token', async (url, options) => {
      requests.push(options);
      if (options.method === 'DELETE') return new Response(null, { status: 204 });
      const release = {
        id: 12,
        tag_name: receipt.tag,
        draft,
        body: foreign ? 'another publication' : receipt.marker,
      };
      return Response.json(new URL(url).pathname.endsWith('/releases') ? [release] : release);
    });
    assert.equal(await api.cleanup(receipt, '123/1'), draft && !foreign);
    if (draft && !foreign) {
      for (const prerelease of [true, false]) {
        await api.publish(receipt, '123/1', prerelease);
        assert.deepEqual(JSON.parse(requests.at(-1).body), {
          draft: false,
          prerelease,
          make_latest: 'false',
        });
      }
    } else {
      await assert.rejects(api.publish(receipt, '123/1', false), /owned draft/);
      assert.ok(requests.every((item) => item.method === 'GET'));
    }
    await assert.rejects(
      api.cleanup({ ...receipt, repository: 'OWNER/other' }, '123/1'),
      /receipt/,
    );
    await assert.rejects(api.cleanup(receipt, '123/2'), /receipt/);
  }
});

test('A new draft binds source SHA and run receipt without setting latest', async () => {
  const { GitHubReleases } = await import('./github.mjs');
  const requests = [];
  const api = new GitHubReleases(
    'OWNER/custom-cabinet',
    'fictional-token',
    async (_url, options) => {
      requests.push(options);
      return Response.json(
        options.method === 'GET' ? [] : { id: 12, tag_name: 'cabinet-v2026.10.01', draft: true },
      );
    },
  );
  const receipt = await api.createDraft('cabinet-v2026.10.01', 'Notes', '123/1', 'a'.repeat(40));
  assert.equal(receipt.id, 12);
  const payload = JSON.parse(requests.at(-1).body);
  assert.equal(payload.target_commitish, 'a'.repeat(40));
  assert.equal(payload.make_latest, 'false');
  assert.ok(payload.body.endsWith(receipt.marker));
});
