package com.moodcurator.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.moodcurator.app.ui.components.CinemaPosterCarousel
import com.moodcurator.app.ui.components.HistorySidebar
import com.moodcurator.app.ui.components.MoodInput
import com.moodcurator.app.ui.components.RecommendationCard
import com.moodcurator.app.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: com.moodcurator.app.ui.viewmodel.HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()

    // Scroll to results when they appear
    LaunchedEffect(uiState.currentResults) {
        if (uiState.currentResults != null) {
            scope.launch {
                listState.animateScrollToItem(1) // Scroll to results section
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            modifier = Modifier.size(40.dp),
                            shape = CircleShape,
                            color = Primary.copy(alpha = 0.1f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Movie,
                                    contentDescription = null,
                                    tint = Primary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                        Text(
                            text = "Mood",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Curator",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Primary
                        )
                    }
                },
                actions = {
                    HistorySidebar(
                        history = uiState.history,
                        isLoading = false,
                        onSelect = { viewModel.selectHistoryItem(it) }
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Background.copy(alpha = 0.8f),
                    titleContentColor = Foreground
                )
            )
        },
        containerColor = Background
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize()) {
            // Background cinema poster carousel
            CinemaPosterCarousel(
                modifier = Modifier.fillMaxSize()
            )
            
            // Content layer
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .fillMaxSize(),
                contentPadding = paddingValues,
                verticalArrangement = Arrangement.spacedBy(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Spacer to push content to center initially
                item {
                    Spacer(modifier = Modifier.height(200.dp))
                }

                // Hero text - centered at top
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "What are you in the\nmood to watch?",
                            style = MaterialTheme.typography.displayMedium,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center,
                            color = Foreground,
                            lineHeight = MaterialTheme.typography.displayMedium.lineHeight
                        )
                        Text(
                            text = "Tell us how you're feeling, and our AI will curate the perfect entertainment list to match your vibe.",
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = TextAlign.Center,
                            color = MutedForeground,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }

                // Spacer before input (swipe up to see)
                item {
                    Spacer(modifier = Modifier.height(80.dp))
                }

                // Mood Input - appears when swiping up
                item {
                    Column(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        // Show error if any
                        uiState.error?.let { error ->
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = Destructive.copy(alpha = 0.2f)
                                ),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "Error: $error",
                                    color = Destructive,
                                    modifier = Modifier.padding(16.dp),
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }
                        
                        MoodInput(
                            onSubmit = { viewModel.createRecommendation(it) },
                            isLoading = uiState.isLoading,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                // Results Section
            item {
                AnimatedVisibility(
                    visible = uiState.currentResults != null,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(24.dp)
                    ) {
                        // Section header
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Curated for you",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = Foreground
                            )
                            TextButton(onClick = { viewModel.clearResults() }) {
                                Text(
                                    text = "Clear results",
                                    color = MutedForeground
                                )
                            }
                        }

                        // Recommendations grid
                        uiState.currentResults?.let { results ->
                            LazyVerticalGrid(
                                columns = GridCells.Adaptive(minSize = 300.dp),
                                horizontalArrangement = Arrangement.spacedBy(16.dp),
                                verticalArrangement = Arrangement.spacedBy(16.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                items(results) { item ->
                                    RecommendationCard(
                                        item = item,
                                        index = results.indexOf(item)
                                    )
                                }
                            }
                        }

                        // Helper text
                        Text(
                            text = "Not quite what you wanted? Try refining your mood description above.",
                            style = MaterialTheme.typography.bodySmall,
                            textAlign = TextAlign.Center,
                            color = MutedForeground,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 16.dp)
                        )
                    }
                }
            }

            // Footer
            item {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Background.copy(alpha = 0.5f)
                ) {
                    Text(
                        text = "© ${java.util.Calendar.getInstance().get(java.util.Calendar.YEAR)} MoodCurator. Powered by AI.",
                        style = MaterialTheme.typography.bodySmall,
                        textAlign = TextAlign.Center,
                        color = MutedForeground,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 32.dp)
                    )
                }
            }
            }
        }
    }
}

