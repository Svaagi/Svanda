import { JUKEBOX_CONFIG_DEFAULTS } from '@svanda/shared';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { CONFIGURATOR_SHEET_QUERY } from 'constants/configurator';
import { CONTACT_PAGE } from 'constants/stage';
import { type ScreenQuad, useStageStore } from 'features/stage';
import { track } from 'lib/analytics';
import { ToastProvider } from 'ui';
import {
  createMatchMediaMock,
  renderAtPath,
  stubResizeObserver,
} from 'utils/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfiguratorSection } from './ConfiguratorSection';
import {
  createInitialConfiguratorValues,
  useConfiguratorStore,
} from './model/configuratorStore';
import { ConfiguratorScreen } from './screen';

vi.mock('lib/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('lib/analytics')>()),
  track: vi.fn(),
}));

const { getState } = useConfiguratorStore;
const PANELS = 'configurator-panels';
const ACTIONS = `${PANELS}-actions`;
const PAGE_HEIGHT_PX = 800;
const FLAT_SCREEN = 'configurator-flat-screen';
const QUAD: ScreenQuad = {
  topLeft: { x: 100, y: 50 },
  topRight: { x: 370, y: 50 },
  bottomRight: { x: 370, y: 530 },
  bottomLeft: { x: 100, y: 530 },
};

function renderConfigurator(path = '/en') {
  return renderAtPath(
    <ToastProvider>
      <ConfiguratorSection />
      <ConfiguratorScreen isPaused={false} />
    </ToastProvider>,
    path,
  );
}

const byTestId = (testId: string) => screen.getByTestId(testId);
const control = (key: string, part: string) =>
  byTestId(`configurator-control-${key}-${part}`);
const screenUi = (design = 'pixel') =>
  byTestId(`configurator-screen-${design}`);
const toastMessage = () => byTestId('toast-message');
const groupTrigger = (column: string, group: string) =>
  byTestId(`${PANELS}-${column}-groups-${group}-trigger`);

describe('ConfiguratorSection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(track).mockClear();
    useConfiguratorStore.setState(createInitialConfiguratorValues());
    useStageStore.setState({
      screenQuad: null,
      viewport: {
        ...useStageStore.getState().viewport,
        height: PAGE_HEIGHT_PX,
      },
    });
    // jsdom has no canvas; the lava lamp has its own spec.
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    vi.stubGlobal('scrollTo', vi.fn());
    stubResizeObserver();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('is a labelled section with the section and design switches', () => {
    renderConfigurator();

    expect(
      screen.getByRole('region', { name: 'Jukebox colour configurator' }),
    ).toBe(byTestId('configurator-section'));
    expect(
      screen.getByRole('radiogroup', { name: 'Section' }),
    ).toBeInTheDocument();
    expect(byTestId('configurator-switches-section-sing')).toHaveAttribute(
      'data-state',
      'on',
    );
    expect(byTestId('configurator-switches-design-pixel')).toHaveAttribute(
      'data-state',
      'on',
    );
    expect(byTestId(`${PANELS}-editing`)).toHaveTextContent(
      'Editing Pixel · Karaoke',
    );
  });

  it('opens the first three groups across both columns', () => {
    renderConfigurator();

    expect(groupTrigger('start', 'background')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(groupTrigger('start', 'effects')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(groupTrigger('end', 'buttons')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(groupTrigger('end', 'songList')).toHaveAttribute(
      'aria-expanded',
      'false',
    );

    fireEvent.click(groupTrigger('end', 'songList'));
    expect(control('modalA', 'slider-thumb')).toBeInTheDocument();
  });

  it('updates the live screen from a colour, a slider and a switch', () => {
    renderConfigurator();

    fireEvent.change(control('acc', 'picker'), {
      target: { value: '#ff4fd8' },
    });
    expect(screenUi().style.getPropertyValue('--app-acc')).toBe('#ff4fd8');
    expect(getState().config.pixel.sing.acc).toBe('#ff4fd8');

    fireEvent.change(control('base', 'hex'), { target: { value: '123456' } });
    fireEvent.keyDown(control('base', 'hex'), { key: 'Enter' });
    expect(screenUi().style.getPropertyValue('--app-base')).toBe('#123456');

    fireEvent.keyDown(control('blobAlpha', 'slider-thumb'), {
      key: 'ArrowLeft',
    });
    expect(getState().config.pixel.sing.blobAlpha).toBeCloseTo(0.55);

    fireEvent.click(control('scan', 'control'));
    expect(getState().config.pixel.sing.scan).toBe(false);
    expect(
      screen.queryByTestId('configurator-screen-lava-scanlines'),
    ).not.toBeInTheDocument();
  });

  it('edits the design and section picked in the switches', () => {
    renderConfigurator();

    fireEvent.click(byTestId('configurator-switches-design-glass'));
    fireEvent.click(byTestId('configurator-switches-section-listen'));

    expect(screenUi('glass')).toHaveAttribute('data-section', 'listen');
    expect(byTestId(`${PANELS}-editing`)).toHaveTextContent(
      'Editing Original · Normal',
    );
    expect(control('blur', 'slider-thumb')).toBeInTheDocument();
    expect(
      screen.queryByTestId('configurator-control-pixel'),
    ).not.toBeInTheDocument();

    fireEvent.change(control('acc', 'picker'), {
      target: { value: '#b6ff4d' },
    });
    expect(getState().config.glass.listen.acc).toBe('#b6ff4d');
    expect(getState().config.pixel.sing.acc).toBe(
      JUKEBOX_CONFIG_DEFAULTS.pixel.sing.acc,
    );
  });

  it('keeps the open groups when the design changes', () => {
    renderConfigurator();
    fireEvent.click(groupTrigger('start', 'effects'));

    fireEvent.click(byTestId('configurator-switches-design-glass'));

    expect(groupTrigger('start', 'effects')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(groupTrigger('start', 'background')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('shows the payment window on the screen from its switch', () => {
    renderConfigurator();

    fireEvent.click(byTestId(`${PANELS}-payment-control`));

    expect(byTestId('configurator-screen-pixel-payment')).toBeInTheDocument();
  });

  it('labels everything in the language of the page', () => {
    renderConfigurator('/');

    expect(byTestId(`${PANELS}-editing`)).toHaveTextContent(
      'Upravujete Pixel · Karaoke',
    );
    expect(byTestId(`${ACTIONS}-reset`)).toHaveTextContent('Výchozí barvy');
  });

  it('stands the live screen flat in the middle column while there is no 3D display', () => {
    renderConfigurator();
    const flatScreen = byTestId(FLAT_SCREEN);

    expect(flatScreen).toHaveAttribute('data-layout', 'columns');
    expect(flatScreen).toContainElement(
      byTestId(`${FLAT_SCREEN}-screen-pixel`),
    );
    fireEvent.click(byTestId('configurator-switches-design-glass'));
    expect(flatScreen).toContainElement(
      byTestId(`${FLAT_SCREEN}-screen-glass`),
    );

    act(() => useStageStore.setState({ screenQuad: QUAD }));
    expect(screen.queryByTestId(FLAT_SCREEN)).not.toBeInTheDocument();
  });

  describe('actions', () => {
    it('attaches the configuration, says so and scrolls to the contact form', () => {
      renderConfigurator();
      const attach = byTestId(`${ACTIONS}-attach`);

      fireEvent.click(attach);

      expect(getState().isAttached).toBe(true);
      expect(attach).toHaveTextContent('Added to e-mail · remove');
      expect(toastMessage()).toHaveTextContent(
        'The configuration will be sent with your request.',
      );
      expect(window.scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: CONTACT_PAGE * PAGE_HEIGHT_PX }),
      );

      fireEvent.click(attach);
      expect(getState().isAttached).toBe(false);
      expect(attach).toHaveTextContent('Add configuration to e-mail');
      expect(window.scrollTo).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledExactlyOnceWith('configurator_attach', {
        source: 'configurator',
      });
    });

    it('resets the design and section being edited', () => {
      renderConfigurator();
      fireEvent.change(control('acc', 'picker'), {
        target: { value: '#ff4fd8' },
      });

      fireEvent.click(byTestId(`${ACTIONS}-reset`));

      expect(getState().config.pixel.sing).toEqual(
        JUKEBOX_CONFIG_DEFAULTS.pixel.sing,
      );
      expect(control('acc', 'hex')).toHaveValue(
        JUKEBOX_CONFIG_DEFAULTS.pixel.sing.acc.toUpperCase(),
      );
      expect(toastMessage()).toHaveTextContent(
        'Default colours restored for Pixel · Karaoke.',
      );
    });

    it('copies the JSON and the CSS variables to the clipboard', async () => {
      const writeText = vi.fn((_text: string) => Promise.resolve());
      vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
      renderConfigurator();

      fireEvent.click(byTestId(`${ACTIONS}-copy-json`));
      await waitFor(() =>
        expect(toastMessage()).toHaveTextContent(
          'All settings copied as JSON.',
        ),
      );
      expect(JSON.parse(writeText.mock.lastCall?.[0] ?? '')).toEqual(
        JUKEBOX_CONFIG_DEFAULTS,
      );

      fireEvent.click(byTestId(`${ACTIONS}-copy-css`));
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
      expect(writeText.mock.lastCall?.[0]).toContain('/* Pixel · Karaoke */');
      expect(vi.mocked(track).mock.calls).toEqual([
        ['configurator_export', { format: 'json' }],
        ['configurator_export', { format: 'css' }],
      ]);
    });

    it('falls back to the import field, selected, when the clipboard is refused', async () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        clipboard: { writeText: () => Promise.reject(new Error('denied')) },
      });
      renderConfigurator();
      const field = screen.getByTestId<HTMLTextAreaElement>(
        `${ACTIONS}-import-text`,
      );
      expect(byTestId(`${ACTIONS}-import`)).not.toBeVisible();

      fireEvent.click(byTestId(`${ACTIONS}-copy-json`));

      await waitFor(() => expect(field).toHaveFocus());
      expect(byTestId(`${ACTIONS}-import`)).toBeVisible();
      expect(byTestId(`${ACTIONS}-import-toggle`)).toHaveAttribute(
        'aria-expanded',
        'true',
      );
      expect(JSON.parse(field.value)).toEqual(JUKEBOX_CONFIG_DEFAULTS);
      expect(field.selectionStart).toBe(0);
      expect(field.selectionEnd).toBe(field.value.length);
      expect(toastMessage()).toHaveTextContent(
        'The text is selected in the field below, copy it with Ctrl+C.',
      );
    });

    it('imports pasted settings and rejects invalid ones', () => {
      renderConfigurator();
      fireEvent.click(byTestId(`${ACTIONS}-import-toggle`));
      const field = byTestId(`${ACTIONS}-import-text`);
      const apply = byTestId(`${ACTIONS}-import-apply`);

      fireEvent.change(field, {
        target: { value: '{"pixel":{"sing":{"acc":"#00ff00"}}}' },
      });
      fireEvent.click(apply);
      expect(screenUi().style.getPropertyValue('--app-acc')).toBe('#00ff00');
      expect(toastMessage()).toHaveTextContent('Settings loaded.');

      fireEvent.change(field, {
        target: { value: '{"pixel":{"sing":{"acc":"red"}}}' },
      });
      fireEvent.click(apply);
      expect(getState().config.pixel.sing.acc).toBe('#00ff00');
    });
  });

  describe('bottom sheet', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'matchMedia',
        createMatchMediaMock([CONFIGURATOR_SHEET_QUERY]).matchMedia,
      );
    });

    it('keeps the controls in a sheet opened from a button', async () => {
      renderConfigurator();

      expect(screen.queryByTestId(`${PANELS}-start`)).not.toBeInTheDocument();
      fireEvent.click(byTestId('configurator-sheet-open'));
      expect(track).toHaveBeenCalledExactlyOnceWith('configurator_open', {
        layout: 'sheet',
      });

      const sheet = screen.getByRole('dialog', { name: 'Colours' });
      expect(sheet).toContainElement(byTestId(`${PANELS}-start`));
      expect(sheet).toContainElement(byTestId(`${PANELS}-end`));
      expect(byTestId('configurator-sheet-close')).toHaveTextContent('Done');

      fireEvent.click(byTestId('configurator-sheet-close'));
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
    });

    it('stands the flat live screen above the sheet while there is no 3D display', () => {
      renderConfigurator();

      expect(byTestId(FLAT_SCREEN)).toHaveAttribute('data-layout', 'sheet');
    });

    it('closes the sheet when the configuration is attached', async () => {
      renderConfigurator();
      fireEvent.click(byTestId('configurator-sheet-open'));

      fireEvent.click(byTestId(`${ACTIONS}-attach`));

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(getState().isAttached).toBe(true);
    });
  });
});
