import React, { useEffect, useState } from "react";
import {Text, Grid, Stack, Center, Space, Loader, Card, Button, useMantineTheme} from "@mantine/core";


const NewsData = ({title, description, link}) => {
    const theme = useMantineTheme();
    // console.log("NewsData props:", {title, description, link});
    return (
        <Card>
            <Stack gap={0}>
            <Text size="lg" mb="xs" weight={500} c={theme.colors.textPrimary[0]}>
                {title}
            </Text>
            <Text fs="italic">
                {description}
            </Text>
            <Button 
                variant="subtle" 
                compact
                color={theme.colors.accentInfo[0]} 
                component="a" 
                href={link} 
                target="_blank"
                rightIcon="→"
                size="xs"
            >
                Sigue leyendo
            </Button>
            </Stack>
        </Card>
    )
}

const ElPais = ({ newsFeedData }) => {
    console.log("ElPais props:", newsFeedData);
    return (
        <Grid>
            {newsFeedData.map((news, index) => (
                <Grid.Col key={index} span={4}>
                    <Stack spacing="md">
                        <NewsData
                            title={news.title}
                            description={news.summary}
                            link={news.link}
                        />
                    </Stack>
                </Grid.Col>
            ))}
        </Grid>
    );
};

const NewsFeed = () => {
    const [newsData, setNewsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNewsData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/news`);
                // const response = await fetch("api/news");

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setNewsData(data);
                console.log("Fetched news data:", data);
            } catch (e) {
                setError(e.message || "Failed to fetch news data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchNewsData();
    }
    , []);
    if (isLoading) {
        return <Loader size="xl"/>;
    }
    if (error) {
        return <Text>{error}</Text>;
    }
    return (
        <Grid overflow="hidden">
            <Grid.Col span={12}>
                <Stack spacing="sm">
                    <ElPais newsFeedData={newsData.elPais} />
                </Stack>
            </Grid.Col>
        </Grid>
    );
}
export default NewsFeed;