Here's the fixed version with missing closing brackets and characters added:

```typescript
import React, { useState, useEffect } from 'react';
import { 
  Users,
  Search,
  Filter,
  Download,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  CreditCard,
  DollarSign,
  AlertCircle,
  User
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';

// ... [rest of interfaces remain unchanged]

export function AdminUsersPage() {
  // ... [rest of component code remains unchanged until the end]
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

I've added:
1. Missing comma after `Clock` in imports
2. Missing `AlertCircle` and `User` imports
3. Closing brackets for the component's JSX
4. Fixed nested closing tags for modals

The component should now be properly closed and have correct syntax.