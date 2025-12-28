package com.moodcurator.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.History
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.moodcurator.app.data.model.MoodRequest
import com.moodcurator.app.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistorySidebar(
    history: List<MoodRequest>,
    isLoading: Boolean,
    onSelect: (MoodRequest) -> Unit,
    modifier: Modifier = Modifier
) {
    var isOpen by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    // History button
    IconButton(
        onClick = { isOpen = true },
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(24.dp))
    ) {
        Icon(
            imageVector = Icons.Default.History,
            contentDescription = "History",
            tint = if (isOpen) Primary else Foreground
        )
    }

    // Modal bottom sheet
    if (isOpen) {
        ModalBottomSheet(
            onDismissRequest = { isOpen = false },
            containerColor = Background.copy(alpha = 0.95f),
            sheetState = sheetState
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                // Header
                Text(
                    text = "History",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = Foreground
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Revisit your past moods and recommendations.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MutedForeground
                )
                Spacer(modifier = Modifier.height(24.dp))

                // History list
                when {
                    isLoading -> {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = Primary)
                        }
                    }
                    history.isEmpty() -> {
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                            color = Color.Transparent
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(32.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "No history yet.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MutedForeground
                                )
                                Text(
                                    text = "Your curation journey starts today!",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MutedForeground
                                )
                            }
                        }
                    }
                    else -> {
                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.height(400.dp)
                        ) {
                            items(history) { item ->
                                HistoryItem(
                                    item = item,
                                    onClick = {
                                        onSelect(item)
                                        isOpen = false
                                    }
                                )
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun HistoryItem(
    item: MoodRequest,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isHovered by remember { mutableStateOf(false) }

    val timeAgo = item.createdAt?.let {
        try {
            val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val date = dateFormat.parse(it)
            date?.let { d ->
                val diff = System.currentTimeMillis() - d.time
                when {
                    diff < 60000 -> "just now"
                    diff < 3600000 -> "${diff / 60000}m ago"
                    diff < 86400000 -> "${diff / 3600000}h ago"
                    else -> "${diff / 86400000}d ago"
                }
            } ?: ""
        } catch (e: Exception) {
            ""
        }
    } ?: ""

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .border(
                1.dp,
                if (isHovered) Primary.copy(alpha = 0.2f) else Color.White.copy(alpha = 0.05f),
                RoundedCornerShape(12.dp)
            )
            .clickable { onClick() },
        color = if (isHovered) Color.White.copy(alpha = 0.05f) else Color.White.copy(alpha = 0.03f)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    text = item.mood,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isHovered) Primary else Foreground.copy(alpha = 0.9f),
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = timeAgo,
                    style = MaterialTheme.typography.labelSmall,
                    color = MutedForeground
                )
            }

            // Recommendation previews
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item.recommendations.take(3).forEach { rec ->
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (isHovered) Primary.copy(alpha = 0.1f) else Color.White.copy(alpha = 0.05f)
                            ),
                        color = Color.Transparent
                    ) {
                        Text(
                            text = rec.title,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (isHovered) Primary.copy(alpha = 0.8f) else MutedForeground,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                if (item.recommendations.size > 3) {
                    Text(
                        text = "+${item.recommendations.size - 3} more",
                        style = MaterialTheme.typography.labelSmall,
                        color = MutedForeground,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}

