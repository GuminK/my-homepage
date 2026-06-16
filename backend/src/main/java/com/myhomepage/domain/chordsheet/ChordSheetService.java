package com.myhomepage.domain.chordsheet;

import com.myhomepage.domain.chordsheet.dto.ChordSheetCreateRequest;
import com.myhomepage.domain.chordsheet.dto.ChordSheetListResponse;
import com.myhomepage.domain.chordsheet.dto.ChordSheetResponse;
import com.myhomepage.domain.user.User;
import com.myhomepage.domain.user.UserRepository;
import com.myhomepage.global.error.BusinessException;
import com.myhomepage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChordSheetService {

    private final ChordSheetRepository chordSheetRepository;
    private final UserRepository userRepository;

    public List<ChordSheetListResponse> getList() {
        return chordSheetRepository.findAllWithAuthor().stream()
                .map(ChordSheetListResponse::from)
                .toList();
    }

    public ChordSheetResponse getById(Long id) {
        ChordSheet chordSheet = chordSheetRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHORD_SHEET_NOT_FOUND));
        return ChordSheetResponse.from(chordSheet);
    }

    @Transactional
    public ChordSheetResponse create(ChordSheetCreateRequest request, Long userId) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        ChordSheet chordSheet = ChordSheet.builder()
                .author(author)
                .title(request.title())
                .artist(request.artist())
                .content(request.content())
                .capo(request.capo())
                .build();

        return ChordSheetResponse.from(chordSheetRepository.save(chordSheet));
    }

    @Transactional
    public ChordSheetResponse update(Long id, ChordSheetCreateRequest request, Long userId) {
        ChordSheet chordSheet = chordSheetRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHORD_SHEET_NOT_FOUND));

        if (!chordSheet.isAuthor(userId)) {
            throw new BusinessException(ErrorCode.CHORD_SHEET_ACCESS_DENIED);
        }

        chordSheet.update(request.title(), request.artist(), request.content(), request.capo());
        return ChordSheetResponse.from(chordSheet);
    }

    @Transactional
    public void delete(Long id, Long userId, boolean isAdmin) {
        ChordSheet chordSheet = chordSheetRepository.findByIdWithAuthor(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.CHORD_SHEET_NOT_FOUND));

        if (!isAdmin && !chordSheet.isAuthor(userId)) {
            throw new BusinessException(ErrorCode.CHORD_SHEET_ACCESS_DENIED);
        }

        chordSheetRepository.delete(chordSheet);
    }
}
