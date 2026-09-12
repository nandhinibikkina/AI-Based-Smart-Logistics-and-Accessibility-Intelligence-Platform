import React from 'react';
import OfflineMap from './OfflineMap';
import type { SampleRoute } from '@/lib/sampleData';

interface LiveMapProps {
  from?: string;
  to?: string;
  source?: string;
  destination?: string;
  highlightLat?: number;
  highlightLng?: number;
  highlightLabel?: string;
  routes?: SampleRoute[];
  className?: string;
  showAllLocations?: boolean;
  showStatusBanner?: boolean;
}

export default function LiveMap(props: LiveMapProps) {
  return <OfflineMap {...props} />;
}
