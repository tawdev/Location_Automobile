declare module "@base-ui/react/merge-props" {
  export function mergeProps<T = any>(...args: any[]): any;
}
declare module "@base-ui/react/use-render" {
  export function useRender(props: any): any;
  export namespace useRender {
    export type ComponentProps<T = any> = any;
  }
}
declare module "@base-ui/react/input" {
  export const Input: any;
}
declare module "@base-ui/react/popover" {
  export namespace Popover {
    export namespace Root {
      export type Props = any;
    }
    export const Root: any;

    export namespace Trigger {
      export type Props = any;
    }
    export const Trigger: any;

    export namespace Popup {
      export type Props = any;
    }
    export const Popup: any;

    export namespace Positioner {
      export type Props = any;
    }
    export const Positioner: any;

    export namespace Title {
      export type Props = any;
    }
    export const Title: any;

    export namespace Description {
      export type Props = any;
    }
    export const Description: any;

    export const Portal: any;
  }
}
declare module "@base-ui/react/select" {
  export namespace Select {
    export const Root: any;
    export namespace Group {
      export type Props = any;
    }
    export const Group: any;

    export namespace Value {
      export type Props = any;
    }
    export const Value: any;

    export namespace Trigger {
      export type Props = any;
    }
    export const Trigger: any;

    export namespace Popup {
      export type Props = any;
    }
    export const Popup: any;

    export namespace Positioner {
      export type Props = any;
    }
    export const Positioner: any;

    export namespace GroupLabel {
      export type Props = any;
    }
    export const GroupLabel: any;

    export namespace Item {
      export type Props = any;
    }
    export const Item: any;

    export namespace Separator {
      export type Props = any;
    }
    export const Separator: any;

    export namespace Icon {
      export type Props = any;
    }
    export const Icon: any;

    export namespace List {
      export type Props = any;
    }
    export const List: any;

    export namespace ItemText {
      export type Props = any;
    }
    export const ItemText: any;

    export namespace ItemIndicator {
      export type Props = any;
    }
    export const ItemIndicator: any;

    export namespace ScrollUpArrow {
      export type Props = any;
    }
    export const ScrollUpArrow: any;

    export namespace ScrollDownArrow {
      export type Props = any;
    }
    export const ScrollDownArrow: any;

    export const Portal: any;
  }
}
