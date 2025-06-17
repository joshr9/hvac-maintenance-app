import React from 'react';
import { Check, Building, Home, Wrench } from 'lucide-react';

const MaintenanceSteps = ({ selectedProperty, selectedSuite }) => {
  const steps = [
    { 
      number: 1, 
      title: 'Select Property', 
      icon: Building,
      completed: !!selectedProperty,
      current: !selectedProperty
    },
    { 
      number: 2, 
      title: 'Select Suite', 
      icon: Home,
      completed: !!selectedSuite,
      current: !!selectedProperty && !selectedSuite
    },
    { 
      number: 3, 
      title: 'Maintenance', 
      icon: Wrench,
      completed: false,
      current: !!selectedProperty && !!selectedSuite
    }
  ];

  const getStepClasses = (step) => {
    if (step.completed) return 'bg-green-500 text-white';
    if (step.current) return 'bg-blue-500 text-white';
    return 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${getStepClasses(step)}`}>
                {step.completed ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-gray-900">{step.title}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-gray-200 mx-4 mt-5 min-w-[100px]"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceSteps;
