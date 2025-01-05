import { SVGProps } from "react";

interface Page {
  Icon?: React.ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  path: string;
  childItems?: Page[];
}

interface Route {
  title: string;
  pages: Page[];
}

const routes: Route[] = [
  {
    title: "Main",
    pages: [
      {
        name: "Dashboard",
        path: "/dashboard",
      },
      {
        name: "Profile",
        path: "/profile",
      },
    ]
  },
  {
    title: "Management",
    pages: [
      {
        name: "Settings",
        path: "/settings",
      },
      {
        name: "Analytics",
        path: "/analytics",
      },
      {
        name: "Transactions",
        path: "/transactions",
        childItems: [
          {
            name: "History",
            path: "/transactions/history",
          },
          {
            name: "Pending",
            path: "/transactions/pending",
          }
        ]
      },
    ]
  },
  {
    title: "Support",
    pages: [
      {
        name: "Documentation",
        path: "/docs",
      }
    ]
  }
];

export default routes; 