export interface ResourceItem {
  id: string;
  hospital: string;
  resource: string; // e.g., 'ICU Beds', 'Oxygen Tanks'
  status: 'Available' | 'In Progress' | 'Urgent' | 'Unknown';
  progress: number; // 0-100
  total: string; // e.g., '8/12'
  createdDate: string; // e.g., '02-09-2025'
  dueDate: string; // e.g., '2h left'
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

type Listener = (resources: ResourceItem[]) => void;

class ResourceService {
  private static instance: ResourceService;
  private resources: ResourceItem[] = [];
  private listeners: Listener[] = [];

  private constructor() {
    // seed with some demo data similar to previous static table
    this.resources = [
      { id: this.id(), hospital: 'City General Hospital', resource: 'ICU Beds', status: 'Available', progress: 75, total: '8/12', createdDate: '02-09-2025', dueDate: '2h left', priority: 'high' },
      { id: this.id(), hospital: 'Metro Medical Center', resource: 'Oxygen Tanks', status: 'In Progress', progress: 45, total: '45/100', createdDate: '02-09-2025', dueDate: '4h left', priority: 'medium' },
      { id: this.id(), hospital: 'Regional Hospital', resource: 'Ventilators', status: 'Urgent', progress: 90, total: '2/5', createdDate: '02-09-2025', dueDate: '1h left', priority: 'urgent' },
      { id: this.id(), hospital: 'Community Health', resource: 'Staff Nurses', status: 'Available', progress: 60, total: '12/20', createdDate: '02-09-2025', dueDate: '6h left', priority: 'low' },
    ];
  }

  public static getInstance(): ResourceService {
    if (!ResourceService.instance) {
      ResourceService.instance = new ResourceService();
    }
    return ResourceService.instance;
  }

  private id(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit() {
    this.listeners.forEach(l => l(this.resources));
  }

  public getResources(): ResourceItem[] {
    return this.resources;
  }

  // High-level admin action: add or update resource stock for a hospital
  public addOrUpdateResource(args: { hospital: string; resourceType: string; quantity: number; note?: string }): void {
    const mapLabel: Record<string, string> = {
      beds: 'Hospital Beds',
      icu: 'ICU Beds',
      oxygen: 'Oxygen Tanks',
      ventilators: 'Ventilators',
      staff: 'Medical Staff',
    } as const;

    const label = mapLabel[args.resourceType] || args.resourceType;

    // Handle negative quantities as requests (needs)
    const isRequest = args.quantity < 0;
    const absQuantity = Math.abs(args.quantity);

    // Try to find existing row for same hospital + resource
    const idx = this.resources.findIndex(r => r.hospital === args.hospital && r.resource === label);
    if (idx >= 0) {
      const current = this.resources[idx];
      
      if (isRequest) {
        // For requests, update to show the need/request
        const [a, b] = current.total.split('/').map(x => parseInt(x, 10) || 0);
        const newTotal = Math.max(b, absQuantity);
        const updated: ResourceItem = {
          ...current,
          total: `${a}/${newTotal} (Need: ${absQuantity})`,
          progress: Math.max(0, Math.min(100, Math.round((a / (newTotal || 1)) * 100))),
          status: a < absQuantity ? 'Urgent' : a < newTotal / 2 ? 'In Progress' : 'Available',
          priority: a < absQuantity ? 'urgent' : 'high',
        };
        this.resources[idx] = updated;
      } else {
        // For additions, bump totals and adjust progress
        const [a, b] = current.total.split('/').map(x => {
          // Handle format like "8/12 (Need: 5)" by extracting just the numbers
          const num = parseInt(x.split(' ')[0], 10) || 0;
          return num;
        });
        const newAvailable = Math.max(0, a + args.quantity);
        const newTotal = Math.max(b, newAvailable);
        const updated: ResourceItem = {
          ...current,
          total: `${newAvailable}/${newTotal}`,
          progress: Math.max(0, Math.min(100, Math.round((newAvailable / (newTotal || 1)) * 100))),
          status: newAvailable <= 3 ? 'Urgent' : newAvailable < newTotal / 2 ? 'In Progress' : 'Available',
          priority: newAvailable <= 3 ? 'urgent' : newAvailable < newTotal / 2 ? 'high' : 'medium',
        };
        this.resources[idx] = updated;
      }
    } else {
      // create a new row
      if (isRequest) {
        // For requests, show as urgent need
        const created: ResourceItem = {
          id: this.id(),
          hospital: args.hospital,
          resource: label,
          status: 'Urgent',
          progress: 0,
          total: `0/${absQuantity} (Requested)`,
          createdDate: new Date().toLocaleDateString('en-GB'),
          dueDate: '—',
          priority: 'urgent',
        };
        this.resources = [created, ...this.resources];
      } else {
        // For additions, create normal entry
        const created: ResourceItem = {
          id: this.id(),
          hospital: args.hospital,
          resource: label,
          status: args.quantity <= 3 ? 'Urgent' : args.quantity < 10 ? 'In Progress' : 'Available',
          progress: Math.max(0, Math.min(100, Math.round((args.quantity / Math.max(10, args.quantity)) * 100))),
          total: `${args.quantity}/${Math.max(10, args.quantity)}`,
          createdDate: new Date().toLocaleDateString('en-GB'),
          dueDate: '—',
          priority: args.quantity <= 3 ? 'urgent' : args.quantity < 10 ? 'high' : 'medium',
        };
        this.resources = [created, ...this.resources];
      }
    }
    this.emit();
  }
}

export default ResourceService;


