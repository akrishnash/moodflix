package com.moodcurator.app.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.moodcurator.app.data.model.Recommendation
import com.moodcurator.app.ui.theme.*

@Composable
fun RecommendationCard(
    item: Recommendation,
    index: Int,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var isHovered by remember { mutableStateOf(false) }
    
    val alpha by animateFloatAsState(
        targetValue = if (isHovered) 1f else 0.5f,
        animationSpec = tween(300),
        label = "alpha"
    )

    val typeIcon = when (item.type) {
        "Movie" -> Icons.Default.Movie
        "TV Show" -> Icons.Default.Tv
        "YouTube Video" -> Icons.Default.PlayArrow
        else -> Icons.Default.Info
    }

    val typeColor = when (item.type) {
        "Movie" -> MovieColor
        "TV Show" -> TVShowColor
        "YouTube Video" -> YouTubeColor
        else -> Primary
    }

    val searchQuery = "${item.title} ${item.type} trailer"
    val searchUrl = "https://www.google.com/search?q=${Uri.encode(searchQuery)}"

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { isHovered = !isHovered }
            .border(
                1.dp,
                Color.White.copy(alpha = 0.05f),
                RoundedCornerShape(12.dp)
            )
            .then(
                if (isHovered) {
                    Modifier.background(
                        Color.White.copy(alpha = 0.05f),
                        RoundedCornerShape(12.dp)
                    )
                } else {
                    Modifier
                }
            ),
        colors = CardDefaults.cardColors(
            containerColor = Color.White.copy(alpha = 0.05f)
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Badge and Title
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.Top
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Type Badge
                    Surface(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .border(1.dp, typeColor.copy(alpha = 0.2f), RoundedCornerShape(12.dp)),
                        color = typeColor.copy(alpha = 0.1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = typeIcon,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = typeColor
                            )
                            Text(
                                text = item.type,
                                style = MaterialTheme.typography.labelSmall,
                                color = typeColor,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    // Title
                    Text(
                        text = item.title,
                        style = MaterialTheme.typography.titleLarge,
                        color = if (isHovered) Primary else Foreground,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Description
            Text(
                text = item.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MutedForeground,
                lineHeight = MaterialTheme.typography.bodyMedium.lineHeight
            )

            // Why it fits section
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(8.dp)),
                color = Secondary.copy(alpha = 0.3f)
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "WHY IT FITS",
                        style = MaterialTheme.typography.labelSmall,
                        color = Accent,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "\"${item.reason}\"",
                        style = MaterialTheme.typography.bodySmall,
                        color = Foreground.copy(alpha = 0.9f),
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                    )
                }
            }

            // Find to watch button
            OutlinedButton(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(searchUrl))
                    context.startActivity(intent)
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = MutedForeground
                ),
            ) {
                Text("Find to watch")
                Spacer(modifier = Modifier.width(8.dp))
                Icon(
                    imageVector = Icons.Default.OpenInNew,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Color.White.copy(alpha = alpha)
                )
            }
        }
    }
}

