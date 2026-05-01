import dayjs from 'dayjs';

interface ConfigValues {
  enabled: boolean;
  display_name: string;
  order: number;
}

export const emailRegEx =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function compare2Objects(x: any, y: any) {
  let leftChain: any[] = [];
  let rightChain: any[] = [];
  let p;

  // remember that NaN === NaN returns false
  // and isNaN(undefined) returns true
  if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
    return true;
  }

  // Compare primitives and functions.
  // Check if both arguments link to the same object.
  // Especially useful on the step where we compare prototypes
  if (x === y) {
    return true;
  }

  // Works in case when functions are created in constructor.
  // Comparing dates is a common scenario. Another built-ins?
  // We can even handle functions passed across iframes
  if (
    (typeof x === 'function' && typeof y === 'function') ||
    (x instanceof Date && y instanceof Date) ||
    (x instanceof RegExp && y instanceof RegExp) ||
    (x instanceof String && y instanceof String) ||
    (x instanceof Number && y instanceof Number)
  ) {
    return x?.toString() === y?.toString();
  }

  // At last checking prototypes as good as we can
  if (!(x instanceof Object && y instanceof Object)) {
    return false;
  }

  if (x?.isPrototypeOf(y) || y?.isPrototypeOf(x)) {
    return false;
  }

  if (x?.constructor !== y?.constructor) {
    return false;
  }

  if (x?.prototype !== y?.prototype) {
    return false;
  }

  // Check for infinitive linking loops
  if (leftChain?.indexOf(x) > -1 || rightChain?.indexOf(y) > -1) {
    return false;
  }

  // Quick checking of one object being a subset of another.
  // todo: cache the structure of arguments[0] for performance
  for (p in y) {
    if (y?.hasOwnProperty(p) !== x?.hasOwnProperty(p)) {
      return false;
    } else if (typeof y[p] !== typeof x[p]) {
      return false;
    }
  }

  for (p in x) {
    if (y?.hasOwnProperty(p) !== x?.hasOwnProperty(p)) {
      return false;
    } else if (typeof y[p] !== typeof x[p]) {
      return false;
    }

    switch (typeof x[p]) {
      case 'object':
      case 'function':
        leftChain.push(x);
        rightChain.push(y);

        if (!compare2Objects(x[p], y[p])) {
          return false;
        }

        leftChain.pop();
        rightChain.pop();
        break;

      default:
        if (x[p] !== y[p]) {
          return false;
        }
        break;
    }
  }

  return true;
}

export const formatDate = (date: any) => dayjs(date).format('MMM DD, YYYY');

export const DEFAULT_CUSTOMER360_CONFIG: Record<string, ConfigValues> = {
  NPS: { enabled: true, display_name: 'NPS', order: 1 },
  Adoption: { enabled: true, display_name: 'Adoption', order: 2 },
  Impact: { enabled: true, display_name: 'Impact', order: 3 },
  Performance: { enabled: true, display_name: 'Performance', order: 4 },
  CustomerService: {
    enabled: true,
    display_name: 'Customer Service',
    order: 5,
  },
  Projects: { enabled: true, display_name: 'Projects', order: 6 },
  Stakeholder: { enabled: true, display_name: 'Stakeholders', order: 7 },
  PurchasesAndRenewals: {
    enabled: true,
    display_name: 'Commercials',
    order: 8,
  },
};
