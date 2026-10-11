import * as RadixAccordion from '@radix-ui/react-accordion';
import type { ReactNode } from 'react';
import { childTestId } from 'utils';

import styles from './accordion.module.css';

export interface AccordionItem {
  value: string;
  title: string;
  content: ReactNode;
}

export interface AccordionProps {
  items: readonly AccordionItem[];
  // The values of the open items; any number can be open at once.
  value: string[];
  onValueChange: (value: string[]) => void;
  testId?: string;
}

// Radix owns the disclosure semantics and the arrow-key roving focus between the triggers.
export function Accordion({
  items,
  value,
  onValueChange,
  testId = 'accordion',
}: AccordionProps) {
  return (
    <RadixAccordion.Root
      type="multiple"
      className={styles.accordion}
      value={value}
      onValueChange={onValueChange}
      data-testid={testId}
    >
      {items.map((item) => {
        const itemTestId = childTestId(testId, item.value);

        return (
          <RadixAccordion.Item
            key={item.value}
            value={item.value}
            className={styles.item}
            data-testid={itemTestId}
          >
            <RadixAccordion.Header className={styles.header}>
              <RadixAccordion.Trigger
                className={styles.trigger}
                data-testid={childTestId(itemTestId, 'trigger')}
              >
                {item.title}
              </RadixAccordion.Trigger>
            </RadixAccordion.Header>
            <RadixAccordion.Content
              className={styles.content}
              data-testid={childTestId(itemTestId, 'content')}
            >
              {item.content}
            </RadixAccordion.Content>
          </RadixAccordion.Item>
        );
      })}
    </RadixAccordion.Root>
  );
}
