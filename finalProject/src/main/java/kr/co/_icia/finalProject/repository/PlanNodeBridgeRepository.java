package kr.co._icia.finalProject.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co._icia.finalProject.entity.PlanNodeBridge;

public interface PlanNodeBridgeRepository extends JpaRepository<PlanNodeBridge, Long>{

	void deleteByPlanDayDetailId_id(Long id);

}
