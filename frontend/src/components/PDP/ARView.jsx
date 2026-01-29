import React, { useRef } from 'react';

const ARView = ({ modelUrl, poster, alt = "3D Model of the plant" }) => {
    const modelViewerRef = useRef(null);

    if (!modelUrl) return null;

    const handleARClick = () => {
        const viewer = modelViewerRef.current;
        if (viewer) {
            if (viewer.canActivateAR) {
                viewer.activateAR();
            } else {
                alert("AR View is only available on mobile devices (iOS/Android). Please open this page on your phone to view in your room!");
            }
        }
    };

    return (
        <div className="w-full bg-gray-100 rounded-xl overflow-hidden relative" style={{ height: '400px' }}>
            <model-viewer
                ref={modelViewerRef}
                src={modelUrl}
                poster={poster}
                alt={alt}
                shadow-intensity="1"
                camera-controls
                auto-rotate
                ar
                ar-modes="webxr scene-viewer quick-look"
                style={{ width: '100%', height: '100%' }}
            >
                <button
                    // Removed slot="ar-button" to keep it always visible and controlled by React
                    onClick={handleARClick}
                    className="absolute bottom-4 right-4 bg-white text-green-700 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-green-50 transition-colors z-10 cursor-pointer"
                >
                    <span className="material-icons text-xl">view_in_ar</span>
                    View in your space
                </button>

                <div slot="progress-bar" className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                    <div className="h-full bg-green-500 transition-all duration-300" style={{ width: '0%' }} id="ar-progress"></div>
                </div>
            </model-viewer>
        </div>
    );
};

export default ARView;
