import React from 'react';

interface Step {
  label: string;
  value: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
        {steps.map((step, index) => (
          <div
            key={step.value}
            className={`flex flex-col items-center ${
              currentStep === step.value
                ? 'text-primary'
                : index < steps.findIndex(s => s.value === currentStep)
                ? 'text-primary'
                : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                currentStep === step.value
                  ? 'bg-primary text-white'
                  : index < steps.findIndex(s => s.value === currentStep)
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}