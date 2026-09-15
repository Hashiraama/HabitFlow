import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  QrCode,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface DeviceInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceInstallModal: React.FC<DeviceInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'github' | 'capacitor'>('instant');

  // Use the live shared preview URL or current window location
  const liveUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-fuqkownvns7gho3jcovpc4-694964950722.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  // SVG QR Code generator for the live URL using simple lightweight QR pattern representation or quick QR image API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    liveUrl
  )}&bgcolor=ffffff&color=059669&margin=8`;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-2xl border border-zinc-200 dark:border-zinc-800 z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  Install on Android / APK
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Live device testing & install options
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl my-3 shrink-0 text-xs font-bold">
            <button
              onClick={() => setActiveTab('instant')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition ${
                activeTab === 'instant'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              1. Phone Install
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition ${
                activeTab === 'github'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              2. Cloud APK
            </button>
            <button
              onClick={() => setActiveTab('capacitor')}
              className={`flex-1 py-1.5 px-2 rounded-xl transition ${
                activeTab === 'capacitor'
                  ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              3. Android Studio
            </button>
          </div>

          {/* Tab Contents */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
            {activeTab === 'instant' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-emerald-800 dark:text-emerald-300 text-xs">
                    <Sparkles size={15} />
                    <span>Instant Live Install (WebAPK on Android)</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-emerald-900/80 dark:text-emerald-200/80">
                    Android automatically compiles this app into a real native APK (WebAPK) when you open it in mobile Chrome! It installs into your app drawer with offline support and runs without browser chrome.
                  </p>
                </div>

                {/* Direct Install Button if in compatible browser */}
                {isInstallable && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 rounded-2xl tile-3d-emerald bg-emerald-600 text-white font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Download size={16} />
                    <span>Install HabitFlow App on this Device</span>
                  </button>
                )}

                {isInstalled && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 size={16} />
                    <span>HabitFlow is already installed on this device!</span>
                  </div>
                )}

                {/* QR Code & Scan Instructions for Testing on your Phone */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 text-center space-y-3">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100">
                    <QrCode size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Scan with your Android Phone Camera:</span>
                  </div>

                  <div className="inline-block p-2.5 bg-white rounded-2xl border border-zinc-200 shadow-xs">
                    <img
                      src={qrCodeUrl}
                      alt="HabitFlow Mobile URL QR Code"
                      className="w-36 h-36 rounded-xl mx-auto block"
                      loading="lazy"
                    />
                  </div>

                  {/* Copy Link Row */}
                  <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
                    <input
                      type="text"
                      readOnly
                      value={liveUrl}
                      className="flex-1 bg-transparent text-[11px] font-mono text-zinc-600 dark:text-zinc-300 truncate outline-none px-1"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 transition"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 text-left space-y-1">
                    <div className="font-bold text-zinc-700 dark:text-zinc-300">How to install on your Android phone:</div>
                    <div>1. Open the copied link in <strong>Chrome for Android</strong> while signed into your account.</div>
                    <div>2. Tap the <strong>three dots menu (&vellip;)</strong> in the top right.</div>
                    <div>3. Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
                    <div>4. Android creates a WebAPK and places the HabitFlow icon in your launcher!</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                  <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Download size={15} className="text-emerald-500" />
                    <span>Automatic Cloud APK Build (GitHub Actions)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    We've configured an automated <strong>Android APK builder workflow</strong> in this repository! You don't need Android Studio or any local tools.
                  </p>
                </div>

                <div className="space-y-2.5 bg-white dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-[11px]">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">How to get your .APK file in 2 minutes:</div>
                  <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-300">
                    <li>In Google AI Studio, click <strong>Settings &rarr; Export to GitHub</strong>.</li>
                    <li>Open your new GitHub repository and click on the <strong>Actions</strong> tab.</li>
                    <li>The <strong>"Build Android APK"</strong> workflow runs automatically.</li>
                    <li>Once finished (~2 min), click the run &rarr; download <strong>HabitFlow-Debug-APK (.zip)</strong>!</li>
                    <li>Unzip the APK, send it to your phone, and tap to install!</li>
                  </ol>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
                  <strong>Why PWABuilder failed:</strong> AI Studio development preview URLs are behind Google authentication cookies. PWABuilder's external crawler cannot bypass the Google login screen, so it cannot read the manifest. Exporting to GitHub or using Chrome's native Install button bypasses this completely.
                </div>
              </div>
            )}

            {activeTab === 'capacitor' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                  <div className="font-extrabold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <Layers size={15} className="text-emerald-500" />
                    <span>Compile APK with Android Studio & Capacitor</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    If you want complete control to build a debug or release APK with Gradle:
                  </p>
                </div>

                <div className="space-y-2 bg-zinc-900 text-zinc-100 p-3.5 rounded-2xl font-mono text-[10px] leading-relaxed">
                  <div className="text-zinc-400"># 1. In AI Studio, click Settings &rarr; "Export to ZIP"</div>
                  <div className="text-zinc-400"># 2. Extract ZIP and run:</div>
                  <div className="text-emerald-400">npm install</div>
                  <div className="text-emerald-400">npm install @capacitor/core @capacitor/android</div>
                  <div className="text-emerald-400">npx cap init HabitFlow com.example.habitflow</div>
                  <div className="text-emerald-400">npm run build</div>
                  <div className="text-emerald-400">npx cap add android</div>
                  <div className="text-emerald-400">npx cap open android</div>
                  <div className="text-zinc-400"># 3. In Android Studio: Build &rarr; Build APK(s)</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Close */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 shrink-0 mt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl tile-3d-press bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
