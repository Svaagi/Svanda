import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Field } from './Field';
import { Input } from './Input';
import { Textarea } from './Textarea';

describe('Field', () => {
  it('labels its control', () => {
    render(
      <Field label="E-mail">
        <Input type="email" />
      </Field>,
    );

    expect(screen.getByTestId('input')).toHaveAccessibleName('E-mail');
    expect(screen.getByTestId('field-label')).toHaveAttribute(
      'for',
      screen.getByTestId('input').id,
    );
  });

  it('describes the control by its hint and error and marks it invalid', () => {
    render(
      <Field label="Message" hint="Optional" error="Too long">
        <Textarea />
      </Field>,
    );
    const textarea = screen.getByTestId('textarea');

    expect(textarea).toHaveAccessibleDescription('Optional Too long');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('field-error')).toHaveTextContent('Too long');
  });

  it('keeps an empty live region ready while there is no error', () => {
    render(
      <Field label="Name">
        <Input />
      </Field>,
    );
    const input = screen.getByTestId('input');

    expect(screen.getByTestId('field-error')).toHaveAttribute(
      'aria-live',
      'polite',
    );
    expect(screen.getByTestId('field-error')).toBeEmptyDOMElement();
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByTestId('field-hint')).not.toBeInTheDocument();
  });

  it('announces an error that appears later', () => {
    const { rerender } = render(
      <Field label="Name">
        <Input />
      </Field>,
    );
    const errorRegion = screen.getByTestId('field-error');

    rerender(
      <Field label="Name" error="Required">
        <Input />
      </Field>,
    );

    expect(screen.getByTestId('field-error')).toBe(errorRegion);
    expect(errorRegion).toHaveTextContent('Required');
    expect(screen.getByTestId('input')).toHaveAccessibleDescription('Required');
  });

  it('keeps a description the control brings itself', () => {
    render(
      <>
        <p id="privacy">We reply within two days.</p>
        <Field label="Name" error="Required">
          <Input aria-describedby="privacy" />
        </Field>
      </>,
    );

    expect(screen.getByTestId('input')).toHaveAccessibleDescription(
      'We reply within two days. Required',
    );
  });

  it('gives each field its own ids', () => {
    render(
      <>
        <Field label="Name" testId="name">
          <Input testId="name-input" />
        </Field>
        <Field label="City" testId="city">
          <Input testId="city-input" />
        </Field>
      </>,
    );

    expect(screen.getByTestId('name-input')).toHaveAccessibleName('Name');
    expect(screen.getByTestId('city-input')).toHaveAccessibleName('City');
    expect(screen.getByTestId('name-input').id).not.toBe(
      screen.getByTestId('city-input').id,
    );
  });
});
