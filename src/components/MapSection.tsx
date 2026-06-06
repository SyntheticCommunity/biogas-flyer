"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    AMap: any;
  }
}

export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    const center: [number, number] = [111.784116, 32.463949];
    let map: any;

    const initMap = () => {
      if (!window.AMap) return;

      map = new window.AMap.Map(container, {
        zoom: 15,
        center,
        mapStyle: "amap://styles/light",
      });

      const marker = new window.AMap.Marker({
        position: center,
        map,
        title: "湖北长投双新环保科技有限公司",
      });

      const info = new window.AMap.InfoWindow({
        content: [
          '<div style="padding:8px;font-size:13px;line-height:1.6;max-width:260px;">',
          '  <div style="font-weight:700;color:#1E3A5F;margin-bottom:4px;">',
          "    湖北长投双新环保科技有限公司",
          "  </div>",
          '  <div style="color:#666;">',
          "    襄阳市老河口市竹林桥镇温岗村<br/>",
          "    联系人：徐工｜电话：13871739715",
          "  </div>",
          "</div>",
        ].join(""),
        offset: new window.AMap.Pixel(0, -30),
      });

      marker.on("click", () => {
        info.open(map, marker.getPosition());
      });

      info.open(map, marker.getPosition());
    };

    if (window.AMap) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src =
        "https://webapi.amap.com/maps?v=2.0&key=263cab24003034453d0e60e9e66fe16d";
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  return <div ref={containerRef} style={{ width: "100%", height: "400px" }} />;
}
