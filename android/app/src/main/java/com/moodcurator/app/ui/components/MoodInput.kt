package com.moodcurator.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.ExperimentalComposeUiApi
import com.moodcurator.app.ui.theme.*

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun MoodInput(
    onSubmit: (String) -> Unit,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    var mood by remember { mutableStateOf("") }
    var isFocused by remember { mutableStateOf(false) }
    val keyboardController = LocalSoftwareKeyboardController.current

    val suggestions = listOf(
        "I'm feeling nostalgic and want something from the 90s...",
        "Had a rough day, need something uplifting and funny...",
        "Want to be scared but not too scared...",
        "Looking for a mind-bending sci-fi mystery...",
    )

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Input container with gradient border
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(
                    brush = Brush.linearGradient(
                        colors = listOf(
                            Color.White.copy(alpha = 0.1f),
                            Color.White.copy(alpha = 0.05f)
                        )
                    )
                )
                .border(
                    width = if (isFocused) 2.dp else 1.dp,
                    color = if (isFocused) Primary.copy(alpha = 0.5f) else Color.White.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(16.dp)
                )
        ) {
            Column {
                // Text area
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Background,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    TextField(
                        value = mood,
                        onValueChange = { mood = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                            .onFocusChanged { focusState ->
                                isFocused = focusState.isFocused
                            },
                        placeholder = {
                            Text(
                                text = "How are you feeling right now? Or what kind of vibe are you looking for?",
                                color = MutedForeground.copy(alpha = 0.5f),
                                style = MaterialTheme.typography.bodyLarge
                            )
                        },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            disabledIndicatorColor = Color.Transparent,
                            focusedTextColor = Foreground,
                            unfocusedTextColor = Foreground
                        ),
                        textStyle = MaterialTheme.typography.bodyLarge,
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                if (mood.trim().isNotEmpty() && !isLoading) {
                                    onSubmit(mood.trim())
                                    keyboardController?.hide()
                                }
                            }
                        ),
                        enabled = !isLoading,
                        maxLines = 5
                    )
                }

                // Bottom section with suggestions and button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Muted.copy(alpha = 0.2f))
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Suggestions
                    AnimatedVisibility(visible = mood.isEmpty() && !isLoading) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            suggestions.take(2).forEach { suggestion ->
                                TextButton(
                                    onClick = { mood = suggestion },
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(20.dp))
                                        .background(Secondary.copy(alpha = 0.5f))
                                        .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(20.dp)),
                                    colors = ButtonDefaults.textButtonColors(
                                        contentColor = MutedForeground
                                    )
                                ) {
                                    Text(
                                        text = "${suggestion.take(25)}...",
                                        style = MaterialTheme.typography.labelSmall
                                    )
                                }
                            }
                        }
                    }

                    // Submit button
                    Button(
                        onClick = {
                            if (mood.trim().isNotEmpty() && !isLoading) {
                                onSubmit(mood.trim())
                                keyboardController?.hide()
                            }
                        },
                        enabled = mood.trim().isNotEmpty() && !isLoading,
                        modifier = Modifier.clip(RoundedCornerShape(24.dp)),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (mood.trim().isNotEmpty()) Primary else Muted,
                            contentColor = if (mood.trim().isNotEmpty()) PrimaryForeground else MutedForeground
                        )
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = PrimaryForeground,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Curating…")
                        } else {
                            Text("Curate")
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.Default.ArrowForward,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }

        // Helper text
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.ArrowForward, // Using available icon as sparkles placeholder
                contentDescription = null,
                modifier = Modifier.size(12.dp),
                tint = Accent
            )
            Text(
                text = "AI-powered curation based on your emotional context",
                style = MaterialTheme.typography.bodySmall,
                color = MutedForeground
            )
            Icon(
                imageVector = Icons.Default.ArrowForward,
                contentDescription = null,
                modifier = Modifier.size(12.dp),
                tint = Accent
            )
        }
    }
}


