export const NAV_GROUPS = [
  {
    id: 'prepare',
    label: '首页',
    icon: 'home',
    color: '#a855f7',
    items: [
      { id: 'auth', label: '授权管理', icon: 'shield-check' },
      { id: 'personal', label: '个人中心', icon: 'user' }
    ]
  },
  {
    id: 'xuanpin',
    label: '亚马逊中心',
    color: '#f97316',
    items: [
      { id: 'xp-amazon-hot',       label: '热销爆品', icon: 'flame'        },
      { id: 'xp-amazon-potential', label: '潜力商品', icon: 'trending-up'  },
      { id: 'xp-amazon-new',       label: '最近上新', icon: 'sparkles'     },
    ]
  },
  {
    id: 'data',
    label: '数据中心',
    icon: 'pie-chart',
    color: '#3b82f6',
    items: [
      { id: 'reputation',     label: '店铺声誉',   icon: 'shield'      },
      { id: 'store-data',     label: '数据概览', icon: 'line-chart' },
      { id: 'product-report', label: '商品性能矩阵', icon: 'layout-grid' },
    ]
  },
  {
    id: 'logistics',
    label: '物流中心',
    icon: 'truck',
    color: '#10b981',
    items: [
      { id: 'logistics-cn',   label: '国内物流哨兵', icon: 'radar' },
      { id: 'logistics-intl', label: '国际订单链路', icon: 'milestone' },
    ]
  },
  {
    id: 'ops',
    label: '工作中心',
    icon: 'briefcase',
    color: '#8b5cf6',
    items: [
      { id: 'data-upload', label: '数据上传', icon: 'upload-cloud' },
      { id: 'today-todo', label: '待办事项', icon: 'check-square' },
    ]
  },
  {
    id: 'test',
    label: '工具/测试',
    icon: 'terminal',
    color: '#ec4899',
    items: [
      { id: 'auto-center', label: '自动化中心', icon: 'cpu' },
      { id: 'notify', label: '通知中心', icon: 'bell' },
    ]
  },
  {
    id: 'admin_group',
    label: '管理控制',
    icon: 'shield',
    color: '#064e3b',
    adminOnly: true,
    isExternal: true,
    externalUrl: '/admin',
    items: [
      { id: 'admin', label: '管理后台', icon: 'command' },
    ]
  }
];

export const findGroupIdByItemId = (itemId) => {
  for (const group of NAV_GROUPS) {
    if (group.items) {
      if (group.items.some(item => item.id === itemId)) return group.id;
    } else if (group.id === itemId) {
      return group.id;
    }
  }
  return null;
};