/**
 * Ambient type declarations for non-code assets.
 *
 * `.svg` — imported as React components via @svgr/webpack (turbopack rule in
 * next.config.ts). Default export is a React FC accepting SVG props; the
 * ReactComponent named export is kept for interop with tooling that expects it.
 */
declare module "*.svg" {
  import type { FC, SVGProps } from "react";

  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
