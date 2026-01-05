import { useEffect, useRef, useState } from "react";
import QRCode from "react-qrcode-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, ClipboardCopy, Download, Link2, RefreshCcw } from "lucide-react";

export function QRCodeGenerator() {
  const [value, setValue] = useState("https://github.com/gcoro/react-qrcode-logo");
  const [size, setSize] = useState(250);
  const [quietZone, setQuietZone] = useState(10);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fgColor, setFgColor] = useState("#000000");
  const [logoImage, setLogoImage] = useState("");
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoObjectUrlRef = useRef<string | null>(null);
  const [syncLogoSize, setSyncLogoSize] = useState(false);
  const [logoWidth, setLogoWidth] = useState(50);
  const [logoHeight, setLogoHeight] = useState(50);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [qrStyle, setQrStyle] = useState<"squares" | "dots" | "fluid">("squares");
  const [eyeRadius, setEyeRadius] = useState(0);
  const [eyeColor, setEyeColor] = useState(""); // Empty means default (fgColor)
  const [enableCORS, setEnableCORS] = useState(false);
  const [removeQrCodeBehindLogo, setRemoveQrCodeBehindLogo] = useState(false);
  const [logoPadding, setLogoPadding] = useState(0);
  const [logoPaddingStyle, setLogoPaddingStyle] = useState<"square" | "circle">("square");
  const [logoPaddingRadius, setLogoPaddingRadius] = useState(0);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied" | "error">(
    "idle",
  );
  const copyStatusTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (logoObjectUrlRef.current) {
        URL.revokeObjectURL(logoObjectUrlRef.current);
        logoObjectUrlRef.current = null;
      }

      if (copyStatusTimeoutRef.current !== null) {
        window.clearTimeout(copyStatusTimeoutRef.current);
        copyStatusTimeoutRef.current = null;
      }
    };
  }, []);

  const setLogoFromFile = (file: File | null) => {
    if (!file) return;

    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current);
      logoObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    logoObjectUrlRef.current = objectUrl;
    setLogoImage(objectUrl);
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setLogoFromFile(file);
  };

  const handleLogoUrlChange = (nextUrl: string) => {
    if (logoObjectUrlRef.current) {
      URL.revokeObjectURL(logoObjectUrlRef.current);
      logoObjectUrlRef.current = null;
    }
    setLogoImage(nextUrl);
  };

  const handleLogoWidthChange = (nextWidth: number) => {
    setLogoWidth(nextWidth);
    if (syncLogoSize) setLogoHeight(nextWidth);
  };

  const handleLogoHeightChange = (nextHeight: number) => {
    setLogoHeight(nextHeight);
    if (syncLogoSize) setLogoWidth(nextHeight);
  };

  const handleDownload = () => {
    const canvas = document.getElementById("react-qrcode-logo") as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement("a");
      a.download = "qrcode.png";
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCopy = async () => {
    const canvas = document.getElementById("react-qrcode-logo") as HTMLCanvasElement;
    if (canvas) {
      setCopyStatus("copying");
      if (copyStatusTimeoutRef.current !== null) {
        window.clearTimeout(copyStatusTimeoutRef.current);
        copyStatusTimeoutRef.current = null;
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setCopyStatus("error");
          copyStatusTimeoutRef.current = window.setTimeout(
            () => setCopyStatus("idle"),
            2500,
          );
          return;
        }

        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setCopyStatus("copied");
          copyStatusTimeoutRef.current = window.setTimeout(
            () => setCopyStatus("idle"),
            2000,
          );
        } catch {
          setCopyStatus("error");
          copyStatusTimeoutRef.current = window.setTimeout(
            () => setCopyStatus("idle"),
            2500,
          );
        }
      }, "image/png");
    }
  };

  const handleReset = () => {
    setValue("");
    setSize(250);
    setQuietZone(10);
    setBgColor("#ffffff");
    setFgColor("#000000");
    handleLogoUrlChange("");
    setLogoWidth(50);
    setLogoHeight(50);
    setLogoOpacity(1);
    setEcLevel("M");
    setQrStyle("squares");
    setEyeRadius(0);
    setEyeColor("");
    setEnableCORS(false);
    setRemoveQrCodeBehindLogo(false);
    setLogoPadding(0);
    setLogoPaddingStyle("square");
    setLogoPaddingRadius(0);
    setCopyStatus("idle");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="value">QR Value</Label>
                <Input
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter text or URL"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dimensions & Colors</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (px)</Label>
                <Input
                  id="size"
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quietZone">Quiet Zone</Label>
                <Input
                  id="quietZone"
                  type="number"
                  value={quietZone}
                  onChange={(e) => setQuietZone(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 p-1"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fgColor">Foreground Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="fgColor"
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 p-1"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Upload Logo</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => logoFileInputRef.current?.click()}
                  >
                    Upload image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLogoUrlChange("")}
                    disabled={!logoImage}
                  >
                    Clear
                  </Button>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logoImage">Logo URL</Label>
                <Input
                  id="logoImage"
                  value={logoImage}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="logoWidth">Logo Width</Label>
                    <Input
                      id="logoWidth"
                      type="number"
                      value={logoWidth}
                      onChange={(e) => handleLogoWidthChange(Number(e.target.value))}
                    />
                  </div>

                  <Toggle
                    id="syncLogoSize"
                    variant="outline"
                    pressed={syncLogoSize}
                    onPressedChange={(pressed) => {
                      setSyncLogoSize(pressed);
                      if (pressed) setLogoHeight(logoWidth);
                    }}
                    aria-label="Sync logo width and height"
                    title="Sync logo width and height"
                  >
                    <Link2 className="size-4" />
                  </Toggle>

                  <div className="space-y-2">
                    <Label htmlFor="logoHeight">Logo Height</Label>
                    <Input
                      id="logoHeight"
                      type="number"
                      value={logoHeight}
                      onChange={(e) => handleLogoHeightChange(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoOpacity">Logo Opacity (0-1)</Label>
                  <Input
                    id="logoOpacity"
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={logoOpacity}
                    onChange={(e) => setLogoOpacity(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoPadding">Logo Padding</Label>
                  <Input
                    id="logoPadding"
                    type="number"
                    value={logoPadding}
                    onChange={(e) => setLogoPadding(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoPaddingStyle">Logo Padding Style</Label>
                  <Select
                    value={logoPaddingStyle}
                    onValueChange={(val) => val && setLogoPaddingStyle(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoPaddingRadius">Logo Padding Radius</Label>
                  <Input
                    id="logoPaddingRadius"
                    type="number"
                    value={logoPaddingRadius}
                    onChange={(e) => setLogoPaddingRadius(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="removeQrCodeBehindLogo"
                    checked={removeQrCodeBehindLogo}
                    onCheckedChange={(checked) =>
                      setRemoveQrCodeBehindLogo(checked === true)
                    }
                  />
                  <Label htmlFor="removeQrCodeBehindLogo">Remove QR Code Behind Logo</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Style & Options</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qrStyle">QR Style</Label>
                <Select
                  value={qrStyle}
                  onValueChange={(val) => val && setQrStyle(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="squares">Squares</SelectItem>
                    <SelectItem value="dots">Dots</SelectItem>
                    <SelectItem value="fluid">Fluid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ecLevel">Error Correction Level</Label>
                <Select
                  value={ecLevel}
                  onValueChange={(val) => val && setEcLevel(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">L - Low (7%)</SelectItem>
                    <SelectItem value="M">M - Medium (15%)</SelectItem>
                    <SelectItem value="Q">Q - Quartile (25%)</SelectItem>
                    <SelectItem value="H">H - High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eyeRadius">Eye Radius</Label>
                <Input
                  id="eyeRadius"
                  type="number"
                  value={eyeRadius}
                  onChange={(e) => setEyeRadius(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eyeColor">Eye Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="eyeColor"
                    type="color"
                    value={eyeColor || fgColor}
                    onChange={(e) => setEyeColor(e.target.value)}
                    className="w-9 p-1"
                  />
                  <Input
                    value={eyeColor}
                    placeholder="Same as foreground"
                    onChange={(e) => setEyeColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableCORS"
                  checked={enableCORS}
                  onCheckedChange={(checked) => setEnableCORS(checked === true)}
                />
                <Label htmlFor="enableCORS">Enable CORS</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center space-y-6">
                <div className="border rounded-lg p-4 bg-white shadow-sm">
                  <QRCode
                    value={value}
                    size={size}
                    quietZone={quietZone}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    logoImage={logoImage}
                    logoWidth={logoWidth}
                    logoHeight={logoHeight}
                    logoOpacity={logoOpacity}
                    ecLevel={ecLevel}
                    qrStyle={qrStyle}
                    eyeRadius={eyeRadius}
                    eyeColor={eyeColor || undefined}
                    enableCORS={enableCORS}
                    removeQrCodeBehindLogo={removeQrCodeBehindLogo}
                    logoPadding={logoPadding}
                    logoPaddingStyle={logoPaddingStyle}
                    logoPaddingRadius={logoPaddingRadius}
                    id="react-qrcode-logo"
                  />
                </div>
                <Button onClick={handleDownload} className="w-full">
                  <Download />
                  Download PNG
                </Button>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex-1"
                  disabled={copyStatus === "copying"}
                >
                  {copyStatus === "copied" ? (
                    <Check />
                  ) : (
                    <ClipboardCopy />
                  )}
                  {copyStatus === "copied"
                    ? "Copied!"
                    : copyStatus === "error"
                      ? "Copy failed"
                      : copyStatus === "copying"
                        ? "Copying…"
                        : "Copy PNG to Clipboard"}
                </Button>
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <RefreshCcw />
                  Reset to Defaults
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
