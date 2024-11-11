import {
  Box,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Text,
  Button,
  useToast,
  List,
  ListItem
} from '@chakra-ui/react';

function SocialMediaResults({ results }) {
  const toast = useToast();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      status: 'success',
      duration: 2000,
    });
  };

  const platforms = ['YouTube', 'TikTok', 'Instagram', 'Facebook', 'LinkedIn'];

  return (
    <Tabs isFitted variant="enclosed">
      <TabList>
        {platforms.map(platform => (
          <Tab key={platform}>{platform}</Tab>
        ))}
      </TabList>

      <TabPanels>
        {platforms.map(platform => {
          const platformData = results[platform.toLowerCase()];
          return (
            <TabPanel key={platform}>
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading size="md" mb={4}>Títulos Sugeridos</Heading>
                  <List spacing={2}>
                    {platformData.titles.map((title, index) => (
                      <ListItem key={index} display="flex" justifyContent="space-between" alignItems="center">
                        <Text>{title}</Text>
                        <Button size="sm" onClick={() => copyToClipboard(title)}>
                          Copiar
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <Heading size="md" mb={4}>Hashtags</Heading>
                  <Box p={4} bg="gray.50" borderRadius="md" position="relative">
                    <Text>{platformData.hashtags}</Text>
                    <Button
                      size="sm"
                      position="absolute"
                      top={2}
                      right={2}
                      onClick={() => copyToClipboard(platformData.hashtags)}
                    >
                      Copiar
                    </Button>
                  </Box>
                </Box>

                <Box>
                  <Heading size="md" mb={4}>Storytelling</Heading>
                  <Box p={4} bg="gray.50" borderRadius="md" position="relative">
                    <Text whiteSpace="pre-wrap">{platformData.story}</Text>
                    <Button
                      size="sm"
                      position="absolute"
                      top={2}
                      right={2}
                      onClick={() => copyToClipboard(platformData.story)}
                    >
                      Copiar
                    </Button>
                  </Box>
                </Box>
              </VStack>
            </TabPanel>
          );
        })}
      </TabPanels>
    </Tabs>
  );
}

export default SocialMediaResults; 