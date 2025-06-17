import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuiteSelectionStep from './SuiteSelectionStep';

const mockProperty = {
  name: 'Test Property',
  address: '123 Main St',
  suites: [
    { id: 1, name: 'Suite A', unitNumber: '101' },
    { id: 2, name: 'Suite B', unitNumber: '102' }
  ]
};

test('renders property name and address', () => {
  render(
    <SuiteSelectionStep
      selectedProperty={mockProperty}
      setSelectedProperty={() => {}}
      handleSuiteSelect={() => {}}
    />
  );
  expect(screen.getByText('Test Property')).toBeInTheDocument();
  expect(screen.getByText('123 Main St')).toBeInTheDocument();
});