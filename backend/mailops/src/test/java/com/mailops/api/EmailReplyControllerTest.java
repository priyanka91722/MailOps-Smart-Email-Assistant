package com.mailops.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mailops.email.EmailReplyRequest;
import com.mailops.email.EmailReplyResponse;
import com.mailops.email.EmailReplyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = {EmailReplyController.class, HealthController.class})
@Import(ApiExceptionHandler.class)
class EmailReplyControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmailReplyService emailReplyService;

    @Test
    void healthEndpointReturnsUpStatus() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void blankEmailContentReturnsReadableValidationError() throws Exception {
        mockMvc.perform(post("/emails/generate-reply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "emailContent": "   ",
                                  "tone": "Professional",
                                  "length": "Medium",
                                  "additionalInstructions": null
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Paste the email you want to reply to."));
    }

    @Test
    void validRequestReturnsGeneratedReply() throws Exception {
        when(emailReplyService.generateReply(any(EmailReplyRequest.class)))
                .thenReturn(EmailReplyResponse.success("Thank you for reaching out."));

        mockMvc.perform(post("/emails/generate-reply")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "emailContent": "Could we meet next Tuesday?",
                                  "tone": "Friendly",
                                  "length": "Short",
                                  "additionalInstructions": "Accept the meeting."
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Thank you for reaching out."))
                .andExpect(jsonPath("$.status").value("success"));
    }
}
