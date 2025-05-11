import React, { lazy, Suspense, useEffect } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
} from '@deriv/quill-icons/LabelPaired';
import { LegacyGuide1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';
import FreeBots from '../free-bots';
import ToolsHub from '../tools-hub';

// Lazy-loaded components
const ChartWrapper = lazy(() => import('../chart/chart-wrapper'));
const Tutorial = lazy(() => import('../tutorials'));
const SmartAnalysisTool = lazy(() => import('../SmartAnalysisTool/SmartAnalysisTool'));
const AnalysisTool = lazy(() => import('../htmltools/AnalysisTool'));
const CopyTrading = lazy(() => import('../htmltools/CopyTrading'));
const SmartAnalysis = lazy(() => import('../htmltools/SmartAnalysis'));

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <h3>{localize('Something went wrong')}</h3>
                    <button onClick={() => window.location.reload()}>
                        {localize('Refresh page')}
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card } = useStore();
    const {
        active_tab,
        active_tour,
        is_chart_modal_visible,
        is_trading_view_modal_visible,
        setActiveTab,
        setWebSocketState,
        setActiveTour,
        setTourDialogVisibility,
    } = dashboard;
    const { onEntered, dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message } = dialog_options as { [key: string]: string };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    const hash = [
        'dashboard',
        'bot_builder',
        'chart',
        'tutorial',
        'freebots',
        'tools-hub',
        'smart-analysis',
    ];
    const { isDesktop } = useDevice();
    const navigate = useNavigate();
    const location = useLocation();

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        return Number(hash.indexOf(String(tab_value)));
    };
    const active_hash_tab = GetHashedValue(active_tab);

    const handleTabChange = React.useCallback(
        (index: number) => {
            if (is_chart_modal_visible || is_trading_view_modal_visible) return;
            setActiveTab(index);
            if (index === BOT_BUILDER) {
                updateWorkspaceName();
            }
            if (index === DASHBOARD) {
                clear();
            }
            navigate(`#${hash[index]}`);
        },
        [is_chart_modal_visible, is_trading_view_modal_visible]
    );

    useEffect(() => {
        if (init_render.current) {
            init_render.current = false;
            return;
        }
        if (connectionStatus === CONNECTION_STATUS.CLOSED) {
            setWebSocketState(false);
        } else if (connectionStatus === CONNECTION_STATUS.OPEN) {
            setWebSocketState(true);
        }
    }, [connectionStatus]);

    useEffect(() => {
        if (active_tour) {
            setTourDialogVisibility(false);
            setActiveTour(false);
        }
    }, [active_tab]);

    useEffect(() => {
        if (dashboard_strategies.length > 0) {
            onEntered();
        }
    }, [dashboard_strategies.length]);

    return (
        <ErrorBoundary>
            <div className='main'>
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                    })}
                >
                    <Tabs
                        active_index={active_tab}
                        className='main__tabs'
                        onTabItemClick={handleTabChange}
                        top
                        history={navigate}
                    >
                        <div
                            label={
                                <>
                                    <LabelPairedObjectsColumnCaptionRegularIcon
                                        height='24px'
                                        width='24px'
                                        fill='var(--text-general)'
                                    />
                                    <Localize i18n_default_text='Dashboard' />
                                </>
                            }
                            id='id-dbot-dashboard'
                        >
                            <Dashboard handleTabChange={handleTabChange} />
                        </div>
                        <div
                            label={
                                <>
                                    <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                        height='24px'
                                        width='24px'
                                        fill='var(--text-general)'
                                    />
                                    <Localize i18n_default_text='Bot Builder' />
                                </>
                            }
                            id='id-dbot-bot-builder'
                        >
                            <ToolsHub />
                        </div>
                        <div
                            label={
                                <>
                                    <LabelPairedChartLineCaptionRegularIcon
                                        height='24px'
                                        width='24px'
                                        fill='var(--text-general)'
                                    />
                                    <Localize i18n_default_text='Analysis Tool' />
                                </>
                            }
                            id='id-analysis-tool'
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Loading Analysis Tool...')} />}>
                                <AnalysisTool />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <LabelPairedChartLineCaptionRegularIcon
                                        height='24px'
                                        width='24px'
                                        fill='var(--text-general)'
                                    />
                                    <Localize i18n_default_text='Copy Trading' />
                                </>
                            }
                            id='id-copy-trading'
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Loading Copy Trading...')} />}>
                                <CopyTrading />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <LabelPairedChartLineCaptionRegularIcon
                                        height='24px'
                                        width='24px'
                                        fill='var(--text-general)'
                                    />
                                    <Localize i18n_default_text='Smart Analysis' />
                                </>
                            }
                            id='id-smart-analysis'
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Loading Smart Analysis...')} />}>
                                <SmartAnalysis />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <LabelPairedChartLineCaptionRegularIcon
                                        height='24px'
                                        width='24px'
                                        fill='var(--text-general)'
                                    />
                                    <Localize i18n_default_text='Charts' />
                                </>
                            }
                            id={
                                is_chart_modal_visible || is_trading_view_modal_visible
                                    ? 'id-charts--disabled'
                                    : 'id-charts'
                            }
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Loading charts...')} />}>
                                <ChartWrapper show_digits_stats={false} />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <LegacyGuide1pxIcon height='24px' width='24px' fill='var(--text-general)' />
                                    <Localize i18n_default_text='Tutorials' />
                                </>
                            }
                            id='id-tutorial'
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Loading tutorials...')} />}>
                                <Tutorial />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                        height='24px'
                                        width='24px'
                                        fill='var(--text-general)'
                                    />
                                    <Localize i18n_default_text='Free Bots' />
                                </>
                            }
                            id='id-free-bots'
                        >
                            <FreeBots />
                        </div>
                    </Tabs>
                </div>
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                portal_element_id='modal_root'
                title={title}
            >
                {message}
            </Dialog>
        </ErrorBoundary>
    );
});

export default AppWrapper;