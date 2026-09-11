import { MapView } from "@/components/map/MapView";
import { LiveConditionsBar } from "@/components/conditions/LiveConditionsBar";

import { useOrcaAPI } from "@/hooks/useOrcaAPI";
import { SOSModal } from "@/components/navigation/SOSModal";
import { useGeolocation } from "@/hooks/useGeolocation";

import {
  getRoute,
  getPFZLines,
  getPFZDistance,
  type RouteResponse,
} from "@/lib/api";

import { useBoundaries } from "@/hooks/useBoundaries";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { ChevronDown } from "lucide-react";

export function NavigationPage() {
  const { t } = useLanguage();

  const geo = useGeolocation();

  const {
    data,
    loading: apiLoading,
    error: apiError,
  } = useOrcaAPI(geo.lat, geo.lon);

  const {
    data: boundariesData,
    loading: boundariesLoading,
    error: boundariesError,
  } = useBoundaries();

  const [pfzLines, setPfzLines] = useState<any | null>(null);

  const [selectedPfzId, setSelectedPfzId] = useState<string | null>(null);

  const [selectedPfz, setSelectedPfz] = useState<any | null>(null);

  const [routeData, setRouteData] = useState<RouteResponse | null>(null);

  const [pfzConditions, setPfzConditions] = useState<any | null>(null);

  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false);

  const [pfzLoading, setPfzLoading] = useState(false);

  const DEMO_PFZ_DATA: Record<string, any> = {
    "pfzlines.49": {
      pfz_id: "PFZ-49",

      // Actual point ON PFZ-49
      nearest_point: {
        latitude: 16.07196231,
        longitude: 81.83858333,
      },

      // Based on PFZ-49 Length property
      distance_km: 60.3,

      safety: {
        overall_status: "caution",
        warnings: ["Moderate wave conditions"],
      },

      weather: {
        wind: "20 km/h",
        waves: "1.9 m",
        temp: "28°C",
      },
    },
    "pfzlines.22": {
      pfz_id: "PFZ-22",
      nearest_point: {
        latitude: 21.30296939,
        longitude: 69.11953144,
      },
      distance_km: 52.4,
      safety: {
        overall_status: "caution",
        warnings: ["Moderate wave conditions"],
      },
      weather: {
        wind: "20 km/h",
        waves: "1.9 m",
        temp: "28°C",
      },
    },
    "pfzlines.27": {
      pfz_id: "PFZ-27",
      // Actual point ON PFZ-27 (first coordinate from the supplied line)
      nearest_point: {
        latitude: 19.45139181,
        longitude: 72.11015701,
      },
      // Demo value; the supplied PFZ line reports Length: 71.3758189277 km
      distance_km: 71.4,
      safety: {
        overall_status: "caution",
        warnings: ["Moderate wave conditions"],
      },
      weather: {
        wind: "20 km/h",
        waves: "1.9 m",
        temp: "28°C",
      },
    },
    "pfzlines.1": {
      pfz_id: "PFZ-1",
      nearest_point: {
        latitude: 11.86454384,
        longitude: 75.00932799,
      },
      distance_km: 28.6,
      safety: {
        overall_status: "caution",
        warnings: ["Moderate wave conditions"],
      },
      weather: {
        wind: "19 km/h",
        waves: "1.8 m",
        temp: "27°C",
      },
    },
    "pfzlines.39": {
      pfz_id: "PFZ-39",

      // Actual point ON PFZ-39
      nearest_point: {
        latitude: 10.07096166,
        longitude: 75.91907921,
      },

      distance_km: 24.3,

      safety: {
        overall_status: "caution",
        warnings: ["Moderate wave conditions"],
      },

      weather: {
        wind: "21 km/h",
        waves: "2.1 m",
        temp: "27°C",
      },
    },

    "pfzlines.33": {
      pfz_id: "PFZ-33",

      // Actual point ON PFZ-33
      nearest_point: {
        latitude: 14.34447362,
        longitude: 74.08510964,
      },

      distance_km: 18.7,

      safety: {
        overall_status: "safe",
        warnings: [],
      },

      weather: {
        wind: "14 km/h",
        waves: "1.4 m",
        temp: "28°C",
      },
    },

    "pfzlines.52": {
      pfz_id: "PFZ-52",

      // Actual point ON PFZ-52
      nearest_point: {
        latitude: 13.2630086,
        longitude: 81.56316072,
      },

      distance_km: 39.2,

      safety: {
        overall_status: "warning",
        warnings: ["Strong winds", "High waves"],
      },

      weather: {
        wind: "27 km/h",
        waves: "2.8 m",
        temp: "26°C",
      },
    },

    "pfzlines.50": {
      pfz_id: "PFZ-50",

      // Actual point ON PFZ-50
      nearest_point: {
        latitude: 13.99588259,
        longitude: 80.90761921,
      },

      distance_km: 31.8,

      safety: {
        overall_status: "safe",
        warnings: [],
      },

      weather: {
        wind: "13 km/h",
        waves: "1.3 m",
        temp: "28°C",
      },
    },

    "pfzlines.51": {
      pfz_id: "PFZ-51",

      // Actual point ON PFZ-51
      nearest_point: {
        latitude: 13.52355958,
        longitude: 80.87073756,
      },

      distance_km: 34.5,

      safety: {
        overall_status: "safe",
        warnings: [],
      },

      weather: {
        wind: "16 km/h",
        waves: "1.5 m",
        temp: "28°C",
      },
    },

    "pfzlines.35": {
      pfz_id: "PFZ-35",

      // Actual point ON PFZ-35
      nearest_point: {
        latitude: 12.64196927,
        longitude: 74.69603625,
      },

      distance_km: 46.5,

      safety: {
        overall_status: "caution",
        warnings: ["Increasing wave activity"],
      },

      weather: {
        wind: "18 km/h",
        waves: "1.9 m",
        temp: "27°C",
      },
    },
  };

  void DEMO_PFZ_DATA;
  /*
   * Load all PFZ lines.
   */
  useEffect(() => {
    let mounted = true;

    getPFZLines()
      .then((lines) => {
        if (mounted) {
          setPfzLines(lines);
        }
      })
      .catch((error) => {
        console.error("Failed to load PFZ lines:", error);

        if (mounted) {
          setPfzLines(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Initially select the nearest PFZ returned
   * by the backend.
   *
   * Backend returns:
   * data.nearest_pfz
   */
  useEffect(() => {
    if (!selectedPfzId && data?.nearest_pfz) {
      setSelectedPfzId(data.nearest_pfz.pfz_id);

      setSelectedPfz(data.nearest_pfz);

      if (geo.lat != null && geo.lon != null) {
        getRoute(
          geo.lat,
          geo.lon,
          data.nearest_pfz.nearest_point.latitude,
          data.nearest_pfz.nearest_point.longitude,
        )
          .then(setRouteData)
          .catch((error) => {
            console.error("Initial PFZ route calculation failed:", error);
          });
      }
    }
  }, [data, geo.lat, geo.lon, selectedPfzId]);

  /*
   * Handle clicking a PFZ line on the map.
   */
  const handlePfzLineClick = async (pfzId: string) => {
    setPfzLoading(true);
    setSelectedPfzId(pfzId);

    try {
      if (geo.lat == null || geo.lon == null) {
        throw new Error("Current location is unavailable.");
      }

      const selectedData = await getPFZDistance(geo.lat, geo.lon, pfzId);
      setSelectedPfz(selectedData);
      setPfzConditions(null);

      const route = await getRoute(
        geo.lat,
        geo.lon,
        selectedData.nearest_point.latitude,
        selectedData.nearest_point.longitude,
      );
      setRouteData(route);
    } catch (error) {
      console.error("PFZ selection or route calculation failed:", error);
    } finally {
      setPfzLoading(false);
    }
  };
  const pfzDistance = selectedPfz?.distance_km ?? null;

  /*
   * Demo boat speed:
   * 20 km/h
   */
  const etaHours = pfzDistance ? pfzDistance / 20 : 0;

  const etaHoursInt = Math.floor(etaHours);

  const etaMinsInt = Math.floor((etaHours - etaHoursInt) * 60);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* ================= MAP ================= */}

      <div className="absolute inset-0 z-0">
        <MapView
          className="w-full h-full"
          userLocation={
            geo.lat != null && geo.lon != null
              ? {
                  lat: geo.lat,
                  lon: geo.lon,
                }
              : undefined
          }
          pfzLocations={
            selectedPfz
              ? [
                  {
                    id: selectedPfz.pfz_id,
                    location: {
                      lat: selectedPfz.nearest_point.latitude,
                      lon: selectedPfz.nearest_point.longitude,
                    },
                  },
                ]
              : undefined
          }
          pfzLines={pfzLines}
          onPfzLineClick={handlePfzLineClick}
          route={routeData?.waypoints}
          showMPAs
          showEEZ
          showIMBL
          boundariesData={boundariesData}
        />

        {/* Boundary loading/error */}

        {(boundariesLoading || boundariesError) && (
          <div className="absolute top-4 left-4 z-50 rounded-xl border border-border/40 bg-card/90 px-4 py-2 text-xs shadow-lg backdrop-blur-md">
            {boundariesLoading && (
              <span className="text-muted-foreground animate-pulse">
                Loading boundary layers...
              </span>
            )}

            {boundariesError && (
              <span className="text-red-500">Boundary layers unavailable.</span>
            )}
          </div>
        )}

        {/* Loading */}

        {(geo.loading || apiLoading || pfzLoading) && (
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-border/40 z-50">
            <span className="text-primary text-sm font-medium animate-pulse">
              {geo.loading
                ? t("getting_location")
                : pfzLoading
                  ? "Checking PFZ..."
                  : t("loading_api")}
            </span>
          </div>
        )}

        {/* Error */}

        {(geo.error || apiError) && (
          <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-md rounded-xl px-4 py-2 shadow-lg border border-red-500/40 z-50">
            <span className="text-red-500 text-sm font-medium">
              {geo.error
                ? `${t("location_error")}: ${geo.error}`
                : t("backend_offline")}
            </span>
          </div>
        )}
      </div>

      {/* ================= FLOATING UI ================= */}

      <div className="relative z-10 flex-1 flex flex-col p-3 md:p-6 gap-4 h-full pointer-events-none">
        {/* ================= BOTTOM ================= */}

        <div className="mt-auto flex flex-col gap-4 w-full pointer-events-auto">
          {isNavigationCollapsed ? (
            <div className="relative rounded-3xl border border-border/40 bg-card/70 p-3 shadow-lg backdrop-blur-xl supports-backdrop-filter:bg-card/55">
              <div className="grid grid-cols-3 gap-3 pr-10">
                <div>
                  <p className="text-xs text-muted-foreground">{t("distance_left")}</p>
                  <p className="font-semibold">{pfzDistance != null ? `${pfzDistance.toFixed(1)} km` : "-- km"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("eta")}</p>
                  <p className="font-semibold">{pfzDistance != null ? `${etaHoursInt}h ${etaMinsInt}m` : "--h --m"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Arrival Time</p>
                  <p className="font-semibold">--:--</p>
                </div>
              </div>
              <button
                onClick={() => setIsNavigationCollapsed(false)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/50 bg-background/40 text-foreground transition-colors hover:bg-background/70"
                aria-label="Expand navigation details"
                title="Expand navigation details"
              >
                <ChevronDown className="rotate-180" size={18} />
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/40 bg-card/70 p-4 shadow-lg backdrop-blur-xl supports-backdrop-filter:bg-card/55 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Navigating to</p>
                  <h3 className="font-semibold text-foreground">
                    {selectedPfz?.pfz_id || "Nearest PFZ"}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSOSOpen(true)}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-colors"
                  >
                    SOS
                  </button>
                  <button
                    onClick={() => setIsNavigationCollapsed(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-background/40 text-foreground transition-colors hover:bg-background/70"
                    aria-label="Collapse navigation details"
                    title="Collapse navigation details"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5 border-y border-border/40 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("distance_left")}</p>
                  <p className="font-semibold">{pfzDistance != null ? `${pfzDistance.toFixed(1)} km` : "-- km"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("eta")}</p>
                  <p className="font-semibold">{pfzDistance != null ? `${etaHoursInt}h ${etaMinsInt}m` : "--h --m"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Arrival Time</p>
                  <p className="font-semibold">--:--</p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-foreground">Live Conditions</h3>

                <button className="text-xs text-primary font-medium flex items-center gap-1">
                  View More &gt;
                </button>
              </div>

              <LiveConditionsBar
                safety={pfzConditions?.safety || data?.safety}
                weather={pfzConditions?.weather || data?.weather}
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= SOS ================= */}

      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </div>
  );
}
