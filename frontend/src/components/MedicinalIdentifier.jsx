import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function MedicinalIdentifier() {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);

  function handlePick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    // Placeholder: simulate analysis delay
    setResult(null);
    setTimeout(() => {
      setResult({
        name: 'Tulsi (Holy Basil)',
        confidence: 0.92,
        medicinalUses: ['Immunity support', 'Respiratory relief', 'Anti-inflammatory'],
      });
    }, 900);
  }

  return (
    <section id="identifier" className="bg-green-50/60" aria-label="Medicinal Plant Identifier">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800">Medicinal Plant Identifier</h2>
          <p className="text-sm text-green-800/70">Upload a plant image to identify</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Upload image</p>
                <p className="text-xs text-green-700/70 mt-1">JPG, PNG up to 5MB</p>
              </div>
              <button
                onClick={handlePick}
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-semibold shadow hover:bg-green-700 transition-colors"
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {fileName && (
              <p className="mt-4 text-sm text-green-800">Selected: {fileName}</p>
            )}
            <div className="mt-4 grid place-items-center rounded-lg border border-dashed border-green-200 bg-green-50/60 p-6 text-center text-green-800/80">
              <p className="text-sm">Your image preview will appear here.</p>
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-green-900">AI Result</p>
            <div className="mt-4 rounded-lg bg-green-50/80 p-4 min-h-[140px] flex items-center">
              {!result && (
                <p className="text-green-800/70 text-sm">No analysis yet. Upload an image to begin.</p>
              )}
              {result && (
                <div>
                  <h3 className="text-lg font-semibold text-green-900">{result.name}</h3>
                  <p className="text-sm text-green-800/80 mt-1">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
                  <ul className="mt-3 list-disc list-inside text-sm text-green-900/90">
                    {result.medicinalUses.map((use) => (
                      <li key={use}>{use}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



