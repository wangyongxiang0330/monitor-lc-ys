import Monitor from './views/Monitor.vue'
import YsMonitor from './views/YsMonitor.vue'
import Index from './views/index.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
let routes = [
	{
	    path: '/',
	    component: Index,
	    name: '',
	    hidden: true
	},
    {
        path: '/monitor',
        component: Monitor,
        name: '',
        hidden: true
    },
    {
        path: '/ysMonitor',
        component: YsMonitor,
        name: '',
        hidden: true
    },
    {
        path: '/index',
        component: Index,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;