import { render, screen } from '@testing-library/react';
import AddTask from './AddTask';

test('renders priority buttons and Add button with proper labels', () => {
  render(
    <AddTask
      isOpen={true}
      onAdd={jest.fn()}
      onClose={jest.fn()}
      projects={[{ id: 'general', name: 'General' }]}
    />
  );

  expect(screen.getByText('Must Do')).toBeInTheDocument();
  expect(screen.getByText('Should Do')).toBeInTheDocument();
  expect(screen.getByText('Could Do')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
});
