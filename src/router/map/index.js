export default [
  {
    path: '/',
    name: 'Root',
    component: () => import('@/views/layout'),
    children: [
      {
        path: '',
        redirect: { name: 'DefaultMap' },
      },
      {
        path: 'default-map',
        name: 'DefaultMap',
        component: () => import('@/views/map/DefaultMap'),
      },
      {
        path: 'marker-map',
        name: 'MarkerMap',
        component: () => import('@/views/map/MarkerMap'),
      },
      {
        path: 'h3-map',
        name: 'H3Map',
        component: () => import('@/views/map/H3Map'),
      },
    ],
  },
];
