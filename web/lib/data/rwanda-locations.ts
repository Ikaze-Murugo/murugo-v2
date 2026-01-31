/**
 * Rwanda administrative hierarchy (Province → District → Sector → Cell).
 * Minimal set for cascading dropdowns; expand as needed.
 */

export interface Cell {
  id: string;
  name: string;
}

export interface Sector {
  id: string;
  name: string;
  cells: Cell[];
}

export interface District {
  id: string;
  name: string;
  sectors: Sector[];
}

export interface Province {
  id: string;
  name: string;
  districts: District[];
}

export const RWANDA_LOCATIONS: Province[] = [
  {
    id: "kigali",
    name: "Kigali City",
    districts: [
      {
        id: "gasabo",
        name: "Gasabo",
        sectors: [
          {
            id: "kimihurura",
            name: "Kimihurura",
            cells: [
              { id: "nyarutarama", name: "Nyarutarama" },
              { id: "remera", name: "Remera" },
              { id: "gisozi", name: "Gisozi" },
              { id: "kacyiru", name: "Kacyiru" },
            ],
          },
          {
            id: "remera",
            name: "Remera",
            cells: [
              { id: "kisimenti", name: "Kisimenti" },
              { id: "rwampara", name: "Rwampara" },
              { id: "gikomero", name: "Gikomero" },
            ],
          },
          {
            id: "gisozi",
            name: "Gisozi",
            cells: [
              { id: "niboye", name: "Niboye" },
              { id: "rutunga", name: "Rutunga" },
            ],
          },
        ],
      },
      {
        id: "kicukiro",
        name: "Kicukiro",
        sectors: [
          {
            id: "gikondo",
            name: "Gikondo",
            cells: [
              { id: "gikondo-cell", name: "Gikondo" },
              { id: "kagarama", name: "Kagarama" },
            ],
          },
          {
            id: "kicukiro-sector",
            name: "Kicukiro",
            cells: [
              { id: "gatenga", name: "Gatenga" },
              { id: "kanombe", name: "Kanombe" },
            ],
          },
        ],
      },
      {
        id: "nyarugenge",
        name: "Nyarugenge",
        sectors: [
          {
            id: "nyarugenge-sector",
            name: "Nyarugenge",
            cells: [
              { id: "nyamirambo", name: "Nyamirambo" },
              { id: "rwezamenyo", name: "Rwezamenyo" },
            ],
          },
          {
            id: "muhima",
            name: "Muhima",
            cells: [
              { id: "muhima-cell", name: "Muhima" },
              { id: "nyakabanda", name: "Nyakabanda" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "eastern",
    name: "Eastern Province",
    districts: [
      {
        id: "rwamagana",
        name: "Rwamagana",
        sectors: [
          {
            id: "rwamagana-sector",
            name: "Rwamagana",
            cells: [
              { id: "gishari", name: "Gishari" },
              { id: "muyumbu", name: "Muyumbu" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "southern",
    name: "Southern Province",
    districts: [
      {
        id: "huye",
        name: "Huye",
        sectors: [
          {
            id: "huye-sector",
            name: "Huye",
            cells: [
              { id: "ngoma", name: "Ngoma" },
              { id: "tumba", name: "Tumba" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "western",
    name: "Western Province",
    districts: [
      {
        id: "rubavu",
        name: "Rubavu",
        sectors: [
          {
            id: "rubavu-sector",
            name: "Rubavu",
            cells: [
              { id: "gisenyi", name: "Gisenyi" },
              { id: "murambi", name: "Murambi" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "northern",
    name: "Northern Province",
    districts: [
      {
        id: "musanze",
        name: "Musanze",
        sectors: [
          {
            id: "musanze-sector",
            name: "Musanze",
            cells: [
              { id: "muhoza", name: "Muhoza" },
              { id: "nyange", name: "Nyange" },
            ],
          },
        ],
      },
    ],
  },
];
