/** 门户服务侧栏菜单（同级页面路径） */
export function usePortalServiceMenu(active: string) {
  return [
    {
      title: '门户服务',
      items: [
        { icon: '🏠', label: '门户首页', path: '/portal', active: active === 'portal' },
        { icon: '🤖', label: '模型服务', path: '/model', active: active === 'model' },
        { icon: '📦', label: '产品服务', path: '/product', active: active === 'product' },
        { icon: '📋', label: '案例中心', path: '/case', active: active === 'case' },
        { icon: '📂', label: '我的需求', path: '/mydemand', active: active === 'mydemand' },
        {
          icon: '🏢',
          label: '企业服务',
          path: '/enterprise',
          active: active === 'enterprise',
        },
        {
          icon: '🔐',
          label: '注册认证',
          path: '/register',
          active: active === 'register',
        },
        {
          icon: '🔔',
          label: '消息通知',
          path: '/msgnotify',
          active: active === 'msgnotify',
        },
        {
          icon: '👤',
          label: '我的信息中心',
          path: '/profile',
          active: active === 'profile',
        },
      ],
    },
  ];
}
