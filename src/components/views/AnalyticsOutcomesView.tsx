import React from 'react';
import { AnalyticsView } from './AnalyticsView';

export interface AnalyticsOutcomesViewProps {
  initialTab?: 'NORTH_STAR' | 'TWO_STAGE_OUTCOMES' | 'EFFORT_ATTRIBUTION' | 'MODEL_SEGREGATION';
}

/**
 * AnalyticsOutcomesView — Modulo M08 & Tracciamento a Due Stadi (Proxy T+14 / Final T+90-240)
 * Conforme alla Product Thesis REDIP v1.0 (§10, §29)
 */
export const AnalyticsOutcomesView: React.FC<AnalyticsOutcomesViewProps> = (props) => {
  return <AnalyticsView {...props} />;
};

export default AnalyticsOutcomesView;
export { AnalyticsView };
