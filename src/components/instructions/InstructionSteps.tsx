import { useTranslation } from 'react-i18next';
import type { InstructionStep } from '@/content/instructionArticles';
import { getInstructionImageAlt, getInstructionImageData } from '@/content/instructionImages';
import { InstructionImage } from './InstructionImage';

interface InstructionStepsProps {
  articleSlug: string;
  steps: InstructionStep[];
  startIndex?: number;
}

export function InstructionSteps({ articleSlug, steps, startIndex = 0 }: InstructionStepsProps) {
  const { t } = useTranslation();

  return (
    <ol className="space-y-7">
      {steps.map((step, index) => {
        const image = getInstructionImageData(articleSlug, startIndex + index);

        return (
          <li
            key={step.id}
            data-instruction-step={step.id}
            className="border-t border-dark-700 pt-6"
          >
            <div className="flex items-start gap-3">
              <span
                aria-label={t('instructions.stepProgress', {
                  current: index + 1,
                  total: steps.length,
                })}
                className="mt-0.5 flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl bg-accent-500/12 px-2 text-sm font-semibold text-accent-300"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-dark-100 sm:text-xl">{step.heading}</h2>
                  {step.optional && (
                    <span className="rounded-full border border-dark-700 bg-dark-800 px-2 py-0.5 text-xs font-medium text-dark-300">
                      {t('instructions.optional')}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-dark-300 sm:text-base">
                  {step.body}
                </p>
                {!image && (
                  <p className="mt-3 text-sm leading-relaxed text-dark-400">{step.caption}</p>
                )}
              </div>
            </div>
            {image && (
              <InstructionImage
                src={image.src}
                alt={getInstructionImageAlt(step.heading)}
                title={step.heading}
                caption={step.caption}
                width={image.width}
                height={image.height}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
