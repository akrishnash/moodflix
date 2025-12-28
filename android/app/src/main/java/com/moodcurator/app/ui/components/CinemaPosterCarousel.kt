package com.moodcurator.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import coil.compose.rememberAsyncImagePainter
import coil.request.ImageRequest
import com.moodcurator.app.ui.theme.Background
import kotlinx.coroutines.launch

/**
 * Background cinema poster carousel that continuously scrolls movie/TV show posters
 * Creates an immersive cinema atmosphere
 */
@Composable
fun CinemaPosterCarousel(
    modifier: Modifier = Modifier
) {
    // Popular movie/TV show poster URLs (using TMDB image base URL format)
    // These are placeholder URLs - in production, fetch from TMDB API
    val posterUrls = remember {
        listOf(
            "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", // Dune
            "https://image.tmdb.org/t/p/w500/kXfqcdQKsToO0OUXHcrrNvhDBzU.jpg", // Shawshank Redemption
            "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // The Godfather
            "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", // The Matrix
            "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Interstellar
            "https://image.tmdb.org/t/p/w500/6KErczPBROQty7QoIsaa6wJYXZi.jpg", // Inception
            "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg", // Spider-Man
            "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61eNJ22NqYzqj.jpg", // Blade Runner
            "https://image.tmdb.org/t/p/w500/5bFK5d3mVTAvBCY5wBW3D9JaJ3A.jpg", // Fight Club
            "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", // The Dark Knight
            "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", // The Matrix
            "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Interstellar
        )
    }

    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    var isAnimating by remember { mutableStateOf(true) }

    // Auto-scroll animation
    LaunchedEffect(Unit) {
        while (isAnimating) {
            val currentIndex = listState.firstVisibleItemIndex
            val itemCount = posterUrls.size
            
            // Scroll to next item smoothly
            scope.launch {
                if (currentIndex < itemCount - 1) {
                    listState.animateScrollToItem(
                        index = currentIndex + 1,
                        scrollOffset = 0
                    )
                } else {
                    // Loop back to start
                    listState.animateScrollToItem(0)
                }
            }
            
            // Wait 3 seconds before next scroll
            kotlinx.coroutines.delay(3000)
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        // Horizontal scrolling poster carousel
        LazyRow(
            state = listState,
            modifier = Modifier
                .fillMaxSize()
                .alpha(0.15f), // Make posters subtle in background
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(horizontal = 8.dp)
        ) {
            // Add duplicates for seamless looping
            items(posterUrls + posterUrls) { posterUrl ->
                PosterImage(
                    imageUrl = posterUrl,
                    modifier = Modifier
                        .width(200.dp)
                        .height(300.dp)
                )
            }
        }

        // Gradient overlay from top and bottom for better text readability
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Background,
                            Color.Transparent,
                            Color.Transparent,
                            Background
                        ),
                        startY = 0f,
                        endY = Float.POSITIVE_INFINITY
                    )
                )
        )
    }
}

@Composable
private fun PosterImage(
    imageUrl: String,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val painter = rememberAsyncImagePainter(
        ImageRequest.Builder(context)
            .data(imageUrl)
            .crossfade(true)
            .build()
    )

    Image(
        painter = painter,
        contentDescription = null,
        modifier = modifier,
        contentScale = ContentScale.Crop
    )
}

