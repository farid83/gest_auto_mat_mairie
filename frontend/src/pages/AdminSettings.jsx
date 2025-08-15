import DirectionsTable from '../components/AdminSettings/DirectionsTable';
import ValidationProcessConfig from '../components/AdminSettings/ValidationProcessConfig';
import StockSettingsForm from '../components/AdminSettings/StockSettingsForm';
import GeneralSettingsForm from '../components/AdminSettings/GeneralSettingsForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const AdminSettings = () => (
  <div className="min-h-screen bg-background p-4">
    <div className="max-w-5xl mx-auto">
      <Tabs defaultValue="directions" className="w-full">
        <TabsList className="flex justify-center mb-6">
          <TabsTrigger value="directions">Directions</TabsTrigger>
          <TabsTrigger value="validation">Processus de validation</TabsTrigger>
          <TabsTrigger value="stock">Paramètres du stock</TabsTrigger>
          <TabsTrigger value="general">Paramètres généraux</TabsTrigger>
        </TabsList>
        <TabsContent value="directions">
          <DirectionsTable />
        </TabsContent>
        <TabsContent value="validation">
          <ValidationProcessConfig />
        </TabsContent>
        <TabsContent value="stock">
          <StockSettingsForm />
        </TabsContent>
        <TabsContent value="general">
          <GeneralSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  </div>
);

export default AdminSettings;
// filepath: c:\Users\ANFAR-Tech\gest_auto_mat_mairie\frontend\src\pages\AdminSettings.jsx