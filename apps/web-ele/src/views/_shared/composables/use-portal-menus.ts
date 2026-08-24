/** 门户服务侧栏菜单（同级页面路径） */
export function usePortalServiceMenu(active: string) {
  return [
    {
      title: '门户服务',
      items: [
        {
          icon: '📦',
          label: '产品服务',
          path: '/service/product',
          active: active === 'product',
        },
        {
          icon: '🤖',
          label: '模型服务',
          path: '/service/model',
          active: active === 'model',
        },
        {
          icon: '📋',
          label: '案例中心',
          path: '/service/case',
          active: active === 'case',
        },
        {
          icon: '🏢',
          label: '企业服务',
          path: '/service/enterprise/supply',
          active: active === 'enterprise',
          children: [
            {
              label: '我的算力供给',
              path: '/service/enterprise/supply',
              active: active === 'enterprise-supply',
            },
            {
              label: '我的算力产品',
              path: '/service/enterprise/products',
              active: active === 'enterprise-products',
            },
          ],
        },
        {
          icon: '📂',
          label: '我的需求',
          path: '/service/mydemand/apps',
          active: active === 'mydemand',
          children: [
            {
              label: '我的应用',
              path: '/service/mydemand/apps',
              active: active === 'mydemand-apps',
            },
            {
              label: '我的算力需求',
              path: '/service/mydemand/compute',
              active: active === 'mydemand-compute',
            },
            {
              label: '应用运行管理',
              path: '/service/mydemand/runtime',
              active: active === 'mydemand-runtime',
            },
          ],
        },
      ],
    },
  ];
}
