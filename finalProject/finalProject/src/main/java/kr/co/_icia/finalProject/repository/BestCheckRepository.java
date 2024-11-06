package kr.co._icia.finalProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co._icia.finalProject.entity.BestCheck;

public interface BestCheckRepository extends JpaRepository<BestCheck, Long> {

  BestCheck findByMemberId(Long memberId);

  BestCheck findByMemberIdAndBoardId(Long memberId, Long boardId);

}