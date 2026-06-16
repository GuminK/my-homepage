package com.myhomepage.domain.chordsheet;

import com.myhomepage.domain.chordsheet.dto.ChordSheetCreateRequest;
import com.myhomepage.domain.chordsheet.dto.ChordSheetListResponse;
import com.myhomepage.domain.chordsheet.dto.ChordSheetResponse;
import com.myhomepage.global.common.ApiResponse;
import com.myhomepage.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "ChordSheet", description = "코드 악보 API")
@RestController
@RequestMapping("/api/v1/chord-sheets")
@RequiredArgsConstructor
public class ChordSheetController {

    private final ChordSheetService chordSheetService;

    @Operation(summary = "코드 악보 목록")
    @GetMapping
    public ApiResponse<List<ChordSheetListResponse>> getList() {
        return ApiResponse.ok(chordSheetService.getList());
    }

    @Operation(summary = "코드 악보 상세")
    @GetMapping("/{id}")
    public ApiResponse<ChordSheetResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(chordSheetService.getById(id));
    }

    @Operation(summary = "코드 악보 작성")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChordSheetResponse> create(
            @Valid @RequestBody ChordSheetCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chordSheetService.create(request, userDetails.getId()));
    }

    @Operation(summary = "코드 악보 수정")
    @PutMapping("/{id}")
    public ApiResponse<ChordSheetResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ChordSheetCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ApiResponse.ok(chordSheetService.update(id, request, userDetails.getId()));
    }

    @Operation(summary = "코드 악보 삭제")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        chordSheetService.delete(id, userDetails.getId(), isAdmin);
    }
}
