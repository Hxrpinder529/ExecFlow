import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, Palette } from "lucide-react";

interface ColorPickerProps {
  color?: string;
  onChange: (color: string) => void;
}

const presetColors = [
  { name: "Amber", value: "38 92% 55%" }, // Your current accent
  { name: "Blue", value: "210 100% 52%" },
  { name: "Green", value: "142 71% 45%" },
  { name: "Purple", value: "270 70% 60%" },
  { name: "Pink", value: "330 85% 60%" },
  { name: "Red", value: "0 84% 60%" },
  { name: "Orange", value: "24 94% 53%" },
  { name: "Teal", value: "180 80% 40%" },
  { name: "Cyan", value: "190 90% 50%" },
  { name: "Indigo", value: "230 70% 60%" },
];

const shadeColors = [
  { name: "Light", value: "60 100% 80%" },
  { name: "Soft", value: "48 96% 70%" },
  { name: "Default", value: "38 92% 55%" },
  { name: "Deep", value: "28 90% 45%" },
  { name: "Dark", value: "18 88% 35%" },
];

export function ColorPicker({ color = "38 92% 55%", onChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(color);
  const [customHue, setCustomHue] = useState(38);
  const [customSaturation, setCustomSaturation] = useState(92);
  const [customLightness, setCustomLightness] = useState(55);

  useEffect(() => {
    // Parse HSL from color string
    const match = color.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (match) {
      setCustomHue(parseInt(match[1]));
      setCustomSaturation(parseInt(match[2]));
      setCustomLightness(parseInt(match[3]));
    }
  }, [color]);

  const handlePresetSelect = (hsl: string) => {
    setSelectedColor(hsl);
    onChange(hsl);
  };

  const handleCustomChange = () => {
    const hsl = `${customHue} ${customSaturation}% ${customLightness}%`;
    setSelectedColor(hsl);
    onChange(hsl);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          style={{
            borderColor: `hsl(${selectedColor})`,
            backgroundColor: `hsl(${selectedColor} / 0.1)`,
          }}
        >
          <Palette className="h-4 w-4" />
          <span>Accent Color</span>
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: `hsl(${selectedColor})` }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Choose Accent Color</h4>
          
          {/* Preset Colors */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Presets</p>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset.value}
                  className={cn(
                    "w-8 h-8 rounded-full relative transition-transform hover:scale-110",
                    selectedColor === preset.value && "ring-2 ring-offset-2 ring-primary"
                  )}
                  style={{ backgroundColor: `hsl(${preset.value})` }}
                  onClick={() => handlePresetSelect(preset.value)}
                  title={preset.name}
                >
                  {selectedColor === preset.value && (
                    <Check className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Shade Variations */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Shades</p>
            <div className="grid grid-cols-5 gap-2">
              {shadeColors.map((shade) => (
                <button
                  key={shade.value}
                  className={cn(
                    "w-8 h-8 rounded-full relative transition-transform hover:scale-110",
                    selectedColor === shade.value && "ring-2 ring-offset-2 ring-primary"
                  )}
                  style={{ backgroundColor: `hsl(${shade.value})` }}
                  onClick={() => handlePresetSelect(shade.value)}
                  title={shade.name}
                >
                  {selectedColor === shade.value && (
                    <Check className="h-4 w-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Picker */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Custom</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs">Hue: {customHue}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={customHue}
                  onChange={(e) => setCustomHue(parseInt(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(0, ${customSaturation}%, ${customLightness}%),
                      hsl(60, ${customSaturation}%, ${customLightness}%),
                      hsl(120, ${customSaturation}%, ${customLightness}%),
                      hsl(180, ${customSaturation}%, ${customLightness}%),
                      hsl(240, ${customSaturation}%, ${customLightness}%),
                      hsl(300, ${customSaturation}%, ${customLightness}%),
                      hsl(360, ${customSaturation}%, ${customLightness}%)
                    )`
                  }}
                />
              </div>
              <div>
                <label className="text-xs">Saturation: {customSaturation}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customSaturation}
                  onChange={(e) => setCustomSaturation(parseInt(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(${customHue}, 0%, ${customLightness}%),
                      hsl(${customHue}, 50%, ${customLightness}%),
                      hsl(${customHue}, 100%, ${customLightness}%)
                    )`
                  }}
                />
              </div>
              <div>
                <label className="text-xs">Lightness: {customLightness}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={customLightness}
                  onChange={(e) => setCustomLightness(parseInt(e.target.value))}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(${customHue}, ${customSaturation}%, 0%),
                      hsl(${customHue}, ${customSaturation}%, 50%),
                      hsl(${customHue}, ${customSaturation}%, 100%)
                    )`
                  }}
                />
              </div>
              <Button size="sm" onClick={handleCustomChange} className="w-full">
                Apply Custom Color
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: `hsl(${selectedColor} / 0.1)` }}>
              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `hsl(${selectedColor})` }} />
              <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: `hsl(${selectedColor} / 0.3)` }} />
              <Button size="sm" className="text-xs" style={{ backgroundColor: `hsl(${selectedColor})` }}>
                Button
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}