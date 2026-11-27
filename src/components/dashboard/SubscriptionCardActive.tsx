import type { Subscription } from '@/types';
import { motion } from 'framer-motion';
import { fadeIn } from '@/components/motion/transitions';
import { SubscriptionHero, type SubscriptionHeroTraffic } from '../subscription/SubscriptionHero';
import { SubscriptionActiveActions, SubscriptionPrimaryAction } from './SubscriptionActiveActions';

interface SubscriptionCardActiveProps {
  subscription: Subscription;
  trafficData: SubscriptionHeroTraffic | null;
  connectedDevices: number | undefined;
  devicesError: boolean;
  connectionUrl?: string | null;
  connectionSelector?: React.ReactNode;
  connectionLinkLoading?: boolean;
  connectionUrlCopied?: boolean;
  onCopyConnectionUrl?: () => void;
  onOpenConnectionQr: () => void;
  onConnectDevice: () => void;
  onManageDevices: () => void;
  onRetryDevices: () => void;
  devicesOpen: boolean;
  onManageSubscription: () => void;
  managementOpen: boolean;
}

export default function SubscriptionCardActive({
  subscription,
  trafficData,
  connectedDevices,
  devicesError,
  connectionUrl,
  connectionSelector,
  connectionLinkLoading,
  connectionUrlCopied = false,
  onCopyConnectionUrl,
  onOpenConnectionQr,
  onConnectDevice,
  onManageDevices,
  onRetryDevices,
  devicesOpen,
  onManageSubscription,
  managementOpen,
}: SubscriptionCardActiveProps) {
  return (
    <motion.div variants={fadeIn} className="space-y-3">
      <SubscriptionHero
        subscription={subscription}
        trafficData={trafficData}
        action={
          <SubscriptionPrimaryAction
            subscription={subscription}
            onManageSubscription={onManageSubscription}
            managementOpen={managementOpen}
            accent
          />
        }
      />
      <SubscriptionActiveActions
        subscription={subscription}
        connectedDevices={connectedDevices}
        devicesError={devicesError}
        connectionUrl={connectionUrl}
        connectionSelector={connectionSelector}
        connectionLinkLoading={connectionLinkLoading}
        connectionUrlCopied={connectionUrlCopied}
        onCopyConnectionUrl={onCopyConnectionUrl}
        onOpenConnectionQr={onOpenConnectionQr}
        onConnectDevice={onConnectDevice}
        onManageDevices={onManageDevices}
        onRetryDevices={onRetryDevices}
        devicesOpen={devicesOpen}
        onManageSubscription={onManageSubscription}
        managementOpen={managementOpen}
        showManagementAction={false}
        illustratedConnection
      />
    </motion.div>
  );
}
