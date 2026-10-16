package com.mailops.email;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

class EmailReplyServiceTest {
    @Test
    void buildsContextualPromptAndReturnsOnlyTheReply() {
        EmailTextGenerator generator = mock(EmailTextGenerator.class);
        when(generator.generate(anyString(), anyString())).thenReturn("  Thanks, I can attend.  ");
        EmailReplyService service = new EmailReplyService(generator, "test-key");

        EmailReplyResponse response = service.generateReply(new EmailReplyRequest(
                "Can you join our interview preparation session on Friday?",
                ReplyTone.Friendly,
                ReplyLength.Short,
                "Accept the invitation."));

        assertEquals("Thanks, I can attend.", response.reply());
        assertEquals("success", response.status());
        org.mockito.ArgumentCaptor<String> systemPrompt = org.mockito.ArgumentCaptor.forClass(String.class);
        org.mockito.ArgumentCaptor<String> userPrompt = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(generator).generate(systemPrompt.capture(), userPrompt.capture());
        assertTrue(systemPrompt.getValue().contains("Do not invent"));
        assertTrue(userPrompt.getValue().contains("Friendly"));
        assertTrue(userPrompt.getValue().contains("Short"));
        assertTrue(userPrompt.getValue().contains("Accept the invitation."));
        assertTrue(userPrompt.getValue().contains("interview preparation session on Friday"));
    }

    @Test
    void missingGeminiKeyReturnsSetupErrorWithoutCallingModel() {
        EmailTextGenerator generator = mock(EmailTextGenerator.class);
        EmailReplyService service = new EmailReplyService(generator, " ");

        assertThrows(GeminiConfigurationException.class, () -> service.generateReply(
                new EmailReplyRequest("Please call me back.", ReplyTone.Professional, ReplyLength.Medium, null)));
        verify(generator, never()).generate(anyString(), anyString());
    }
}
