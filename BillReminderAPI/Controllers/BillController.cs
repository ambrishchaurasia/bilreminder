using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class BillController : ControllerBase
{
    static List<Bill> bills = new List<Bill>();

    [HttpGet]
    public List<object> GetBills()
    {
        return bills.Select(b =>
        {
            var daysLate = (DateTime.Now - b.DueDate).Days;

            return new
            {
                b.Id,
                b.Name,
                b.Amount,
                b.DueDate,
                Status = DateTime.Now > b.DueDate ? "Overdue" : "Upcoming",
                Penalty = daysLate > 0 ? daysLate * 10 : 0
            };
        }).ToList<object>();
    }

    [HttpPost]
    public void AddBill(Bill bill)
    {
        bill.Id = bills.Count + 1;
        bills.Add(bill);
    }
}