import { useEffect } from 'react';
import { Card, CardHeader, Button, Title, Text } from '@fluentui/react-components';
import { CheckmarkCircle24Regular } from '@fluentui/react-icons';
import * as microsoftTeams from '@microsoft/teams-js';

const ConfigPage = () => {
  useEffect(() => {
    // Initialize Teams SDK
    microsoftTeams.initialize();
    
    // Register save handler
    microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {
      // Get the entity ID (usually the tab/page name)
      const entityId = document.getElementById('tabName') as HTMLInputElement;
      
      // Set the settings
      microsoftTeams.settings.setSettings({
        suggestedDisplayName: entityId.value,
        entityId: entityId.value,
        contentUrl: `${window.location.origin}/calendar`,
        websiteUrl: `${window.location.origin}/calendar`
      });
      
      saveEvent.notifySuccess();
    });
    
    // Enable the save button
    microsoftTeams.settings.setValidityState(true);
  }, []);
  
  return (
    <Card className="config-container">
      <CardHeader
        header={
          <Title>Configure Voxerion Tab</Title>
        }
      />
      
      <div className="config-content">
        <div className="config-form">
          <Text weight="semibold">Tab Name</Text>
          <input
            id="tabName"
            type="text"
            placeholder="Voxerion"
            defaultValue="Voxerion Calendar"
            className="config-input"
          />
          
          <div className="config-features">
            <Text weight="semibold">Features Available in This Tab:</Text>
            
            <div className="feature-item">
              <CheckmarkCircle24Regular className="feature-icon" />
              <Text>Calendar integration with Microsoft 365</Text>
            </div>
            
            <div className="feature-item">
              <CheckmarkCircle24Regular className="feature-icon" />
              <Text>Meeting insights powered by AI</Text>
            </div>
            
            <div className="feature-item">
              <CheckmarkCircle24Regular className="feature-icon" />
              <Text>Communication suggestions for better leadership</Text>
            </div>
          </div>
          
          <Text size={200}>
            Click Save below to add the Voxerion tab to your Teams environment.
          </Text>
        </div>
      </div>
      
      <div className="config-actions">
        <Button appearance="primary" onClick={() => microsoftTeams.settings.setValidityState(true)}>
          Ready to Save
        </Button>
      </div>
    </Card>
  );
};

export default ConfigPage;