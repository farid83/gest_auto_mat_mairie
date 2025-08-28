import React from 'react';
import InventoryTable from '../components/Inventory/InventoryTable';
import StockMovementsTable from '../components/StockMovements/StockMovementsTable';
import ReadyToDeliverTable from '../components/ReadyToDeliver/ReadyToDeliverTable';
import DeliveriesTable from '../components/Deliveries/DeliveriesTable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const MaterialsManagement = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          {/* <TabsTrigger value="movements">Mouvements</TabsTrigger>
          <TabsTrigger value="ready">Prêts à livrer</TabsTrigger>
          <TabsTrigger value="deliveries">Livraisons</TabsTrigger> */}
        </TabsList>
        <TabsContent value="inventory">
          <InventoryTable />
        </TabsContent>
        <TabsContent value="movements">
          <StockMovementsTable />
        </TabsContent>
        <TabsContent value="ready">
          <ReadyToDeliverTable />
        </TabsContent>
        <TabsContent value="deliveries">
          <DeliveriesTable />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

export default MaterialsManagement;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\pages\MaterialsManagement.jsx