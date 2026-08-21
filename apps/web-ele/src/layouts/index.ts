const BasicLayout = () => import('./basic.vue');
const PortalLayout = () => import('./portal.vue');

const IFrameView = () => import('@vben/layouts').then((m) => m.IFrameView);

export { BasicLayout, IFrameView, PortalLayout };
