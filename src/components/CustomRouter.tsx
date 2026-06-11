import { useState, useEffect } from 'react';

export interface RouteState {
  path: string;
  categoryName?: string;
  productSlug?: string;
  vendorId?: string;
  orderId?: string;
  page: number; // For category pagination
  searchQuery: string;
}

// Parse current window hash into a nice structured object
export function parseHash(hash: string): RouteState {
  // strip lead hash symbol
  const cleaned = hash.replace(/^#\/?/, '') || '/';
  
  // separate path from query string
  const [pathPart, queryPart] = cleaned.split('?');
  
  // Parse query parameters
  const queryParams = new URLSearchParams(queryPart || '');
  const pageVal = queryParams.get('page');
  const searchVal = queryParams.get('q') || '';
  const page = pageVal ? parseInt(pageVal, 10) : 1;

  const segments = pathPart.split('/').filter(Boolean);

  let routeState: RouteState = {
    path: pathPart,
    page: isNaN(page) ? 1 : page,
    searchQuery: searchVal
  };

  // Check matching rules
  if (segments[0] === 'category') {
    routeState.categoryName = decodeURIComponent(segments[1] || '');
    if (segments[2]) {
      routeState.productSlug = decodeURIComponent(segments[2]);
    }
  } else if (segments[0] === 'section' && segments[1]) {
    routeState.path = 'section';
    routeState.categoryName = decodeURIComponent(segments[1]);
  } else if (segments[0] === 'vendor' && segments[1]) {
    routeState.vendorId = decodeURIComponent(segments[1]);
  } else if (segments[0] === 'track-order' && segments[1]) {
    routeState.orderId = decodeURIComponent(segments[1]);
  } else if (segments[0] === 'order-status' && segments[1]) {
    routeState.path = 'order-status';
    routeState.orderId = decodeURIComponent(segments[1]);
  } else if (segments[0] === 'checkout') {
    routeState.path = 'checkout';
  } else if (segments[0] === 'order-summary') {
    routeState.path = 'order-summary';
  } else if (segments[0] === 'shipping-address') {
    routeState.path = 'shipping-address';
  } else if (segments[0] === 'cart') {
    routeState.path = 'cart';
  } else if (segments[0] === 'vendor-portal') {
    routeState.path = 'vendor-portal';
  } else if (segments[0] === 'wishlist') {
    routeState.path = 'wishlist';
  } else if (segments[0] === 'login') {
    routeState.path = 'login';
  } else if (segments[0] === 'register') {
    routeState.path = 'register';
  } else if (segments[0] === 'verify-otp') {
    routeState.path = 'verify-otp';
  } else if (segments[0] === 'admin') {
    routeState.path = 'admin';
  } else if (segments[0] === 'profile') {
    routeState.path = 'profile';
  } else if (segments[0] === 'my-orders') {
    routeState.path = 'my-orders';
  } else if (segments[0] === 'notifications') {
    routeState.path = 'notifications';
  } else if (segments[0] === 'addresses') {
    routeState.path = 'addresses';
  } else {
    routeState.path = '/';
  }

  return routeState;
}

export function useHashRouter() {
  const [route, setRoute] = useState<RouteState>(() => parseHash(window.location.hash));

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string, options?: { page?: number; q?: string }) => {
    let hashUrl = `#/${path}`;
    const params = new URLSearchParams();
    
    if (options?.page && options.page > 1) {
      params.set('page', options.page.toString());
    }
    if (options?.q) {
      params.set('q', options.q);
    }

    const searchStr = params.toString();
    if (searchStr) {
      hashUrl += `?${searchStr}`;
    }

    window.location.hash = hashUrl;
  };

  return {
    route,
    navigate,
    rawHash: window.location.hash
  };
}
