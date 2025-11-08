import React from 'react';
import InventoryTable from '../components/Inventory/InventoryTable';
import StockMovementsTable from '../components/StockMovements/StockMovementsTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const MaterialsManagement = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          {/* <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="ready">Prêts à livrer</TabsTrigger> */}

        </TabsList>
        <TabsContent value="inventory">
          <InventoryTable />
        </TabsContent>
        <TabsContent value="movements">
          <StockMovementsTable />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

export default MaterialsManagement;