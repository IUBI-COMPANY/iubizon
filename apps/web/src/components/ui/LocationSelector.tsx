"use client";

import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useGeolocation, calculateDistance } from "@/hooks/useGeolocation";
import { createClient } from "@/lib/supabase/client";

interface LocationSelectorProps {
  userId: string;
  currentLocation?: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  onLocationUpdate?: () => void;
}

export function LocationSelector({
  userId,
  currentLocation,
  currentLatitude,
  currentLongitude,
  onLocationUpdate,
}: LocationSelectorProps) {
  const [locationName, setLocationName] = useState(currentLocation || "");
  const [saving, setSaving] = useState(false);
  const { coordinates, isLoading, error, refresh } = useGeolocation();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    if (!userId) return;

    setSaving(true);
    const supabase = createClient();

    const updates: Record<string, any> = {
      location: locationName,
    };

    if (coordinates) {
      updates.latitude = coordinates.latitude;
      updates.longitude = coordinates.longitude;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    setSaving(false);

    if (!error) {
      setShowSuccess(true);
      onLocationUpdate?.();
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDetectLocation = () => {
    refresh();
  };

  const distance =
    currentLatitude && currentLongitude && coordinates
      ? calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          currentLatitude,
          currentLongitude,
        )
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-[#f25c05]" />
        <h3 className="font-medium text-[#112237]">Tu ubicación</h3>
      </div>

      <div className="space-y-3">
        <Input
          placeholder="Ciudad, distrito, zona..."
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />

        {error && <p className="text-sm text-red-500">{error.message}</p>}

        {currentLatitude && currentLongitude && (
          <p className="text-sm text-[#64748b]">
            📍 Ubicación guardada: {currentLatitude.toFixed(4)},{" "}
            {currentLongitude.toFixed(4)}
          </p>
        )}

        {coordinates && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            ✓ Tu ubicación actual detectada
            {distance !== null &&
              ` (${distance.toFixed(1)} km de tu ubicación guardada)`}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleDetectLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Detectando...
              </>
            ) : (
              "Detectar mi ubicación"
            )}
          </Button>

          <Button onClick={handleSave} disabled={saving || !locationName}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {showSuccess && (
          <p className="text-sm text-green-600 font-medium">
            Ubicación guardada correctamente
          </p>
        )}
      </div>
    </div>
  );
}
