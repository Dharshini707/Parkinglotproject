"use client";
import MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, Maximize, Loader2 } from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getDocumentTheme() {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function useResolvedTheme(themeProp) {
  const [detectedTheme, setDetectedTheme] = useState(
    () => getDocumentTheme() ?? getSystemTheme()
  );
  useEffect(() => {
    if (themeProp) return;
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) setDetectedTheme(docTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      if (!getDocumentTheme()) setDetectedTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => { observer.disconnect(); mediaQuery.removeEventListener("change", handleSystemChange); };
  }, [themeProp]);
  return themeProp ?? detectedTheme;
}

const MapContext = createContext(null);

function getViewport(map) {
  const center = map.getCenter();
  return { center: [center.lng, center.lat], zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
}

function useMap() {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMap must be used within a Map component");
  return context;
}

const defaultStyles = {
  dark:  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

const DefaultLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex gap-1">
      <span className="size-1.5 rounded-full bg-white/30 animate-pulse" />
      <span className="size-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:150ms]" />
      <span className="size-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:300ms]" />
    </div>
  </div>
);

const Map = forwardRef(function Map({ children, className, style, theme: themeProp, styles, projection, viewport, onViewportChange, marker, ...props }, ref) {
  const containerRef      = useRef(null);
  const [mapInstance, setMapInstance]     = useState(null);
  const [isLoaded, setIsLoaded]           = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef   = useRef(null);
  const styleTimeoutRef   = useRef(null);
  const internalUpdateRef = useRef(false);
  const resolvedTheme     = useResolvedTheme(themeProp);
  const isControlled      = viewport !== undefined && onViewportChange !== undefined;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const mapStyles = useMemo(() => ({
    dark:  styles?.dark  ?? defaultStyles.dark,
    light: styles?.light ?? defaultStyles.light,
  }), [styles]);

  useImperativeHandle(ref, () => mapInstance, [mapInstance]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) { clearTimeout(styleTimeoutRef.current); styleTimeoutRef.current = null; }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;
    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
      ...viewport,
    });
    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) map.setProjection(projection);
      }, 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const handleMove  = () => { if (internalUpdateRef.current) return; onViewportChangeRef.current?.(getViewport(map)); };
    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", handleMove);
    setMapInstance(map);
    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", handleMove);
      map.remove();
      setIsLoaded(false); setIsStyleLoaded(false); setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return;
    if (mapInstance.isMoving()) return;
    const current = getViewport(mapInstance);
    const next = {
      center:  viewport.center  ?? current.center,
      zoom:    viewport.zoom    ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch:   viewport.pitch   ?? current.pitch,
    };
    if (next.center[0]===current.center[0] && next.center[1]===current.center[1] && next.zoom===current.zoom && next.bearing===current.bearing && next.pitch===current.pitch) return;
    internalUpdateRef.current = true;
    mapInstance.jumpTo(next);
    internalUpdateRef.current = false;
  }, [mapInstance, isControlled, viewport]);

  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;
    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  useEffect(() => {
    if (!mapInstance || isLoaded === false) return;
    const center = props.center;
    const zoom   = props.zoom;
    if (center || zoom !== undefined) {
      const currentZoom   = mapInstance.getZoom();
      const currentCenter = mapInstance.getCenter();
      const newCenter = center ?? [currentCenter.lng, currentCenter.lat];
      const newZoom   = zoom !== undefined ? zoom : currentZoom;
      if (newCenter[0]!==currentCenter.lng || newCenter[1]!==currentCenter.lat || newZoom!==currentZoom) {
        mapInstance.flyTo({ center: newCenter, zoom: newZoom, duration: 1000 });
      }
    }
  }, [mapInstance, isLoaded, props.center, props.zoom]);

  const contextValue = useMemo(() => ({ map: mapInstance, isLoaded: isLoaded && isStyleLoaded }), [mapInstance, isLoaded, isStyleLoaded]);

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn("relative w-full h-full", className)} style={style}>
        {!isLoaded && <DefaultLoader />}
        {mapInstance && (
          <>
            {marker && (
              <MapMarker longitude={marker.longitude} latitude={marker.latitude} offset={[0, -16]}>
                <MarkerContent>
                  <div style={{ width:"32px", height:"32px", backgroundColor:"#dc2626", borderRadius:"50%", border:"3px solid white", boxShadow:"0 2px 8px rgba(0,0,0,0.3)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }} />
                  {marker.label && <MarkerLabel position="top">{marker.label}</MarkerLabel>}
                </MarkerContent>
              </MapMarker>
            )}
            {children}
          </>
        )}
      </div>
    </MapContext.Provider>
  );
});

const MarkerContext = createContext(null);
function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("Marker components must be used within MapMarker");
  return context;
}

function MapMarker({ longitude, latitude, children, onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd, draggable = false, ...markerOptions }) {
  const { map } = useMap();
  const callbacksRef = useRef({ onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd });
  callbacksRef.current = { onClick, onMouseEnter, onMouseLeave, onDragStart, onDrag, onDragEnd };

  const marker = useMemo(() => {
    const markerElement = document.createElement("div");
    markerElement.style.cssText = "display:flex;align-items:center;justify-content:center;cursor:pointer;";
    const markerInstance = new MapLibreGL.Marker({ ...markerOptions, element: markerElement, draggable }).setLngLat([longitude, latitude]);
    markerInstance.getElement()?.addEventListener("click", (e) => callbacksRef.current.onClick?.(e));
    markerInstance.getElement()?.addEventListener("mouseenter", (e) => callbacksRef.current.onMouseEnter?.(e));
    markerInstance.getElement()?.addEventListener("mouseleave", (e) => callbacksRef.current.onMouseLeave?.(e));
    markerInstance.on("dragstart", () => { const l = markerInstance.getLngLat(); callbacksRef.current.onDragStart?.({ lng: l.lng, lat: l.lat }); });
    markerInstance.on("drag",      () => { const l = markerInstance.getLngLat(); callbacksRef.current.onDrag?.({ lng: l.lng, lat: l.lat }); });
    markerInstance.on("dragend",   () => { const l = markerInstance.getLngLat(); callbacksRef.current.onDragEnd?.({ lng: l.lng, lat: l.lat }); });
    return markerInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => marker.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (marker.getLngLat().lng !== longitude || marker.getLngLat().lat !== latitude) marker.setLngLat([longitude, latitude]);
  if (marker.isDraggable() !== draggable) marker.setDraggable(draggable);
  const currentOffset = marker.getOffset();
  const newOffset = markerOptions.offset ?? [0, 0];
  const [newOffsetX, newOffsetY] = Array.isArray(newOffset) ? newOffset : [newOffset.x, newOffset.y];
  if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) marker.setOffset(newOffset);
  if (marker.getRotation() !== markerOptions.rotation) marker.setRotation(markerOptions.rotation ?? 0);

  return <MarkerContext.Provider value={{ marker, map }}>{children}</MarkerContext.Provider>;
}

function MarkerContent({ children, className }) {
  const { marker } = useMarkerContext();
  return createPortal(
    <div className={cn("flex items-center justify-center", className)}>{children}</div>,
    marker.getElement()
  );
}

function MarkerLabel({ children, className, position = "top" }) {
  const positionClasses = { top: "bottom-full mb-1", bottom: "top-full mt-1" };
  return (
    <div className={cn("absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground", positionClasses[position], className)}>
      {children}
    </div>
  );
}

function MapPopup({ longitude, latitude, onClose, children, className, closeButton = false, ...popupOptions }) {
  const { map }   = useMap();
  const popupOptionsRef = useRef(popupOptions);
  const onCloseRef      = useRef(onClose);
  onCloseRef.current    = onClose;
  const container = useMemo(() => document.createElement("div"), []);

  const popup = useMemo(() => {
    return new MapLibreGL.Popup({ offset: 16, ...popupOptions, closeButton: false })
      .setMaxWidth("none").setLngLat([longitude, latitude]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    const onCloseProp = () => onCloseRef.current?.();
    popup.on("close", onCloseProp);
    popup.setDOMContent(container);
    popup.addTo(map);
    return () => { popup.off("close", onCloseProp); if (popup.isOpen()) popup.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  if (popup.isOpen()) {
    if (popup.getLngLat().lng !== longitude || popup.getLngLat().lat !== latitude) popup.setLngLat([longitude, latitude]);
    const prev = popupOptionsRef.current;
    if (prev.offset !== popupOptions.offset) popup.setOffset(popupOptions.offset ?? 16);
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth) popup.setMaxWidth(popupOptions.maxWidth ?? "none");
    popupOptionsRef.current = popupOptions;
  }

  return createPortal(
    <div className={cn("relative rounded-xl border border-white/10 bg-[rgba(8,20,14,0.97)] p-4 text-white shadow-2xl", className)}>
      {closeButton && (
        <button type="button" onClick={() => popup.remove()} className="absolute top-2 right-2 z-10 rounded-sm opacity-70 hover:opacity-100" aria-label="Close popup">
          <X className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>,
    container
  );
}

const positionClasses = {
  "top-left": "top-2 left-2", "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2", "bottom-right": "bottom-10 right-2",
};

function ControlGroup({ children }) {
  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-[rgba(8,20,14,0.9)] shadow-lg overflow-hidden backdrop-blur-sm [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-white/10">
      {children}
    </div>
  );
}

function ControlButton({ onClick, label, children, disabled = false }) {
  return (
    <button onClick={onClick} aria-label={label} type="button"
      className={cn("flex items-center justify-center size-9 hover:bg-white/10 transition-colors text-white", disabled && "opacity-50 pointer-events-none cursor-not-allowed")}
      disabled={disabled}>
      {children}
    </button>
  );
}

function MapControls({ position = "bottom-right", showZoom = true, showLocate = false, showFullscreen = false, className, onLocate }) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);
  const handleZoomIn  = useCallback(() => map?.zoomTo(map.getZoom() + 1, { duration: 300 }), [map]);
  const handleZoomOut = useCallback(() => map?.zoomTo(map.getZoom() - 1, { duration: 300 }), [map]);
  const handleLocate  = useCallback(() => {
    setWaitingForLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
          map?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, duration: 1500 });
          onLocate?.(coords);
          setWaitingForLocation(false);
        },
        (error) => { console.error("Error getting location:", error); setWaitingForLocation(false); }
      );
    }
  }, [map, onLocate]);
  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    document.fullscreenElement ? document.exitFullscreen() : container.requestFullscreen();
  }, [map]);

  return (
    <div className={cn("absolute z-10 flex flex-col gap-1.5", positionClasses[position], className)}>
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={handleZoomIn}  label="Zoom in"><Plus  className="size-4" /></ControlButton>
          <ControlButton onClick={handleZoomOut} label="Zoom out"><Minus className="size-4" /></ControlButton>
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton onClick={handleLocate} label="Find my location" disabled={waitingForLocation}>
            {waitingForLocation ? <Loader2 className="size-4 animate-spin" /> : <Locate className="size-4" />}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton onClick={handleFullscreen} label="Toggle fullscreen"><Maximize className="size-4" /></ControlButton>
        </ControlGroup>
      )}
    </div>
  );
}

function MapRoute({ id: propId, coordinates, color = "#14b371", width = 4, opacity = 0.85, dashArray, onClick, onMouseEnter, onMouseLeave, interactive = true }) {
  const { map, isLoaded } = useMap();
  const autoId   = useId();
  const id       = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId  = `route-layer-${id}`;

  useEffect(() => {
    if (!isLoaded || !map) return;
    map.addSource(sourceId, { type:"geojson", data:{ type:"Feature", properties:{}, geometry:{ type:"LineString", coordinates:[] } } });
    map.addLayer({ id:layerId, type:"line", source:sourceId, layout:{ "line-join":"round","line-cap":"round" }, paint:{ "line-color":color, "line-width":width, "line-opacity":opacity, ...(dashArray&&{"line-dasharray":dashArray}) } });
    return () => { try { if (map.getLayer(layerId)) map.removeLayer(layerId); if (map.getSource(sourceId)) map.removeSource(sourceId); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map]);

  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return;
    const source = map.getSource(sourceId);
    if (source) source.setData({ type:"Feature", properties:{}, geometry:{ type:"LineString", coordinates } });
  }, [isLoaded, map, coordinates, sourceId]);

  return null;
}

export { Map, useMap, MapMarker, MarkerContent, MarkerLabel, MapPopup, MapControls, MapRoute };
